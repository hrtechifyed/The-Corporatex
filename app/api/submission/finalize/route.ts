import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { contributionSubmissionSchema, uuidSchema } from '@/lib/schemas';
import { analyseStory } from '@/lib/story-analysis';
import { HIGHLIGHT_FIELDS } from '@/lib/review';
import { prepareSubmissionHandoff } from '@/lib/submission-handoff';

type GuidedRow = { question_key: string; answer: string; sort_order: number };

const handoffSchema = z.object({ handoffId: uuidSchema });
const SHIFT_TOPIC_LABELS: Record<string, string> = {
  leadership: 'Leadership',
  team: 'Culture',
  workload: 'Workload',
  structure: 'Structure',
  compensation: 'Compensation',
  'technology-ai': 'AI',
  expectations: 'Expectations',
  other: 'Other change',
};

async function currentLabels(id: string) {
  const admin = createAdminClient();
  const { data } = await admin.from('experience_labels').select('label').eq('experience_id', id);
  return (data || []).map((row) => String(row.label));
}

export async function POST(req: Request) {
  const admin = createAdminClient();

  try {
    const raw = await req.json();
    const sessionClient = await createClient();
    const { data: { user }, error: userError } = await sessionClient.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: 'Verify your email before submitting.' }, { status: 401 });
    if (!user.email) return NextResponse.json({ error: 'A verified email address is required.' }, { status: 422 });

    let handoffId: string;
    const handoff = handoffSchema.safeParse(raw);
    if (handoff.success) {
      handoffId = handoff.data.handoffId;
    } else {
      const draft = contributionSubmissionSchema.parse(raw);
      handoffId = draft.draftId;
      await prepareSubmissionHandoff(user.id, user.email, draft);
    }

    const { data: experience, error: experienceError } = await admin
      .from('experiences')
      .select('id,profile_id,status,broad_function,broad_region,approximate_tenure,work_arrangement,main_reason,approved_headline,approved_summary,ai_analysis,companies(display_name)')
      .eq('id', handoffId)
      .maybeSingle();
    if (experienceError) throw experienceError;
    if (!experience) return NextResponse.json({ error: 'The recoverable submission could not be found. Return to Final Cut and request a new verification link.' }, { status: 404 });
    if (experience.profile_id !== user.id) return NextResponse.json({ error: 'This private contribution belongs to a different account.' }, { status: 403 });

    if (['pending_moderation', 'published'].includes(experience.status)) {
      return NextResponse.json({ id: handoffId, status: experience.status, liveLabels: await currentLabels(handoffId), idempotent: true }, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (!['draft', 'awaiting_ai_analysis', 'awaiting_user_approval'].includes(experience.status)) {
      return NextResponse.json({ error: 'This contribution cannot be submitted from its current state.' }, { status: 409 });
    }

    const { data: guidedData, error: guidedError } = await admin
      .from('guided_answers')
      .select('question_key,answer,sort_order')
      .eq('experience_id', handoffId)
      .order('sort_order');
    if (guidedError) throw guidedError;
    const guided = (guidedData || []) as GuidedRow[];
    const companyRelation = experience.companies as unknown as { display_name?: string } | Array<{ display_name?: string }> | null;
    const companyName = Array.isArray(companyRelation) ? companyRelation[0]?.display_name || '' : companyRelation?.display_name || '';

    const analysis = await analyseStory({
      context: {
        companyName,
        broadFunction: experience.broad_function || '',
        broadRegion: experience.broad_region || '',
        approximateTenure: experience.approximate_tenure || '',
        workArrangement: experience.work_arrangement || '',
      },
      guided,
      freeText: `${experience.approved_headline || ''}\n${experience.approved_summary || ''}`,
    });

    const safetyFlags = [...analysis.possibleIdentifyingDetails, ...analysis.possibleAbusiveContent];
    if (safetyFlags.length) {
      return NextResponse.json({ error: 'The saved Final Cut still contains a safety indicator. Review it before submitting.', flags: safetyFlags }, { status: 422 });
    }

    if (experience.status === 'draft') {
      const awaitingAnalysis = await admin.from('experiences').update({ status: 'awaiting_ai_analysis' }).eq('id', handoffId).eq('status', 'draft');
      if (awaitingAnalysis.error) throw awaitingAnalysis.error;
    }

    if (experience.status === 'draft' || experience.status === 'awaiting_ai_analysis') {
      const awaitingApproval = await admin.from('experiences').update({
        ai_analysis: analysis,
        approved_headline: experience.approved_headline,
        approved_summary: experience.approved_summary,
        status: 'awaiting_user_approval',
      }).eq('id', handoffId);
      if (awaitingApproval.error) throw awaitingApproval.error;
    } else {
      const refreshed = await admin.from('experiences').update({ ai_analysis: analysis }).eq('id', handoffId);
      if (refreshed.error) throw refreshed.error;
    }

    const highlights = HIGHLIGHT_FIELDS.flatMap(([key, category], sort) => {
      const content = String(analysis[key] || '').trim();
      return content ? [{ experience_id: handoffId, category, content, contributor_approved: true, sort_order: sort }] : [];
    });
    const removedHighlights = await admin.from('experience_highlights').delete().eq('experience_id', handoffId);
    if (removedHighlights.error) throw removedHighlights.error;
    if (highlights.length) {
      const storedHighlights = await admin.from('experience_highlights').insert(highlights);
      if (storedHighlights.error) throw storedHighlights.error;
    }

    const shiftTopics = guided
      .filter((row) => row.question_key.startsWith('shift_topic:'))
      .map((row) => row.question_key.slice('shift_topic:'.length));
    const liveLabels = Array.from(new Set([
      String(experience.main_reason || ''),
      ...shiftTopics.map((topic) => SHIFT_TOPIC_LABELS[topic]).filter(Boolean),
      ...analysis.suggestedLabels,
    ].filter(Boolean))).slice(0, 12);

    const removedLabels = await admin.from('experience_labels').delete().eq('experience_id', handoffId);
    if (removedLabels.error) throw removedLabels.error;
    if (liveLabels.length) {
      const storedLabels = await admin.from('experience_labels').insert(liveLabels.map((label) => ({ experience_id: handoffId, label })));
      if (storedLabels.error) throw storedLabels.error;
    }

    const submitted = await admin.from('experiences').update({ status: 'pending_moderation' }).eq('id', handoffId).eq('status', 'awaiting_user_approval');
    if (submitted.error) throw submitted.error;

    return NextResponse.json({ id: handoffId, status: 'pending_moderation', liveLabels }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('CorporateX verified submission failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Submission failed' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
}
