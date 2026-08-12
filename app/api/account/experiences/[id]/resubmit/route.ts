import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ownedExperience } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { uuidSchema } from '@/lib/schemas';
import { analyseStory } from '@/lib/story-analysis';
import { HIGHLIGHT_FIELDS } from '@/lib/review';
import { SCENES } from '@/lib/types';

const beatKeys = SCENES.map(([key]) => key);
const schema = z.object({
  headline: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(20).max(1200),
  beats: z.record(z.string(), z.string().max(1800)),
  technologyFollowUp: z.string().max(1800).default(''),
});

type GuidedRow = { experience_id: string; question_key: string; answer: string; sort_order: number };

const SHIFT_TOPIC_LABELS: Record<string, string> = {
  leadership: 'Leadership', team: 'Culture', workload: 'Workload', structure: 'Structure',
  compensation: 'Compensation', 'technology-ai': 'AI', expectations: 'Expectations', other: 'Other change',
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    uuidSchema.parse(id);
    const input = schema.parse(await req.json());
    for (const key of Object.keys(input.beats)) {
      if (!beatKeys.includes(key as (typeof beatKeys)[number])) return NextResponse.json({ error: `Unknown Story Beat: ${key}` }, { status: 422 });
    }
    const authoredLength = Object.values(input.beats).map((value) => value.replace(/\s+/g, ' ').trim()).join(' ').length;
    if (authoredLength < 60) return NextResponse.json({ error: 'Add at least one or two sentences of your own experience before resubmitting.' }, { status: 422 });

    const { experience, profile } = await ownedExperience(id);
    if (experience.status !== 'changes_requested') return NextResponse.json({ error: 'This story is not currently awaiting contributor changes.' }, { status: 409 });

    const admin = createAdminClient();
    const { data: existingRows, error: existingError } = await admin.from('guided_answers').select('question_key,answer,sort_order').eq('experience_id', id).order('sort_order');
    if (existingError) throw existingError;
    const shiftTopics = (existingRows || []).filter((row) => String(row.question_key).startsWith('shift_topic:')).map((row) => String(row.question_key).slice('shift_topic:'.length));

    const guided: GuidedRow[] = SCENES.flatMap(([key], index) => {
      const answer = String(input.beats[key] || '').trim();
      return answer ? [{ experience_id: id, question_key: key, answer, sort_order: index * 10 }] : [];
    });
    if (input.technologyFollowUp.trim()) guided.push({ experience_id: id, question_key: 'shift_technology_followup', answer: input.technologyFollowUp.trim(), sort_order: 31 });
    shiftTopics.forEach((topic, index) => guided.push({ experience_id: id, question_key: `shift_topic:${topic}`, answer: topic, sort_order: 40 + index }));

    const removed = await admin.from('guided_answers').delete().eq('experience_id', id);
    if (removed.error) throw removed.error;
    if (guided.length) {
      const stored = await admin.from('guided_answers').insert(guided);
      if (stored.error) throw stored.error;
    }

    const analysis = await analyseStory({
      context: {
        broadFunction: experience.broad_function || '', broadRegion: experience.broad_region || '',
        approximateTenure: experience.approximate_tenure || '', workArrangement: experience.work_arrangement || '',
      },
      guided,
      freeText: `${input.headline}\n${input.summary}`,
    });
    const flags = [...analysis.possibleIdentifyingDetails, ...analysis.possibleAbusiveContent];
    if (flags.length) return NextResponse.json({ error: 'The revised story still contains a safety indicator.', flags }, { status: 422 });

    const first = await admin.from('experiences').update({ approved_headline: input.headline, approved_summary: input.summary, status: 'awaiting_ai_analysis' }).eq('id', id).eq('profile_id', profile.id).eq('status', 'changes_requested');
    if (first.error) throw first.error;
    const second = await admin.from('experiences').update({ ai_analysis: analysis, status: 'awaiting_user_approval' }).eq('id', id).eq('status', 'awaiting_ai_analysis');
    if (second.error) throw second.error;

    const highlights = HIGHLIGHT_FIELDS.flatMap(([key, category], sort) => {
      const content = String(analysis[key] || '').trim();
      return content ? [{ experience_id: id, category, content, contributor_approved: true, sort_order: sort }] : [];
    });
    const removedHighlights = await admin.from('experience_highlights').delete().eq('experience_id', id);
    if (removedHighlights.error) throw removedHighlights.error;
    if (highlights.length) {
      const storedHighlights = await admin.from('experience_highlights').insert(highlights);
      if (storedHighlights.error) throw storedHighlights.error;
    }

    const liveLabels = Array.from(new Set([
      String(experience.main_reason || ''),
      ...shiftTopics.map((topic) => SHIFT_TOPIC_LABELS[topic]).filter(Boolean),
      ...analysis.suggestedLabels,
    ].filter(Boolean))).slice(0, 12);
    const removedLabels = await admin.from('experience_labels').delete().eq('experience_id', id);
    if (removedLabels.error) throw removedLabels.error;
    if (liveLabels.length) {
      const storedLabels = await admin.from('experience_labels').insert(liveLabels.map((label) => ({ experience_id: id, label })));
      if (storedLabels.error) throw storedLabels.error;
    }

    const submitted = await admin.from('experiences').update({ status: 'pending_moderation' }).eq('id', id).eq('status', 'awaiting_user_approval');
    if (submitted.error) throw submitted.error;
    return NextResponse.json({ status: 'pending_moderation' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Resubmission failed' }, { status: 400 });
  }
}
