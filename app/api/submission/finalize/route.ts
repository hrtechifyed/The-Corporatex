import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { allocateHrtId } from '@/lib/identity';
import { slugify } from '@/lib/slug';
import { contributionSubmissionSchema } from '@/lib/schemas';
import { analyseStory } from '@/lib/story-analysis';
import { HIGHLIGHT_FIELDS } from '@/lib/review';
import { SCENES } from '@/lib/types';

type GuidedRow = { question_key: string; answer: string; sort_order: number };

export async function POST(req: Request) {
  let createdExperienceId: string | null = null;
  const admin = createAdminClient();

  try {
    const input = contributionSubmissionSchema.parse(await req.json());
    const sessionClient = await createClient();
    const { data: { user }, error: userError } = await sessionClient.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: 'Verify your email before submitting.' }, { status: 401 });
    if (!user.email) return NextResponse.json({ error: 'A verified email address is required.' }, { status: 422 });

    const guided: GuidedRow[] = SCENES.flatMap(([key], index) => {
      const answer = String(input.finalCut.beats[key] || '').trim();
      return answer ? [{ question_key: key, answer, sort_order: index * 10 }] : [];
    });
    if (input.finalCut.technologyFollowUp.trim()) {
      guided.push({ question_key: 'shift_technology_followup', answer: input.finalCut.technologyFollowUp.trim(), sort_order: 31 });
    }

    const analysis = await analyseStory({
      context: input.context,
      guided,
      freeText: `${input.finalCut.headline}\n${input.finalCut.summary}`,
    });
    const safetyFlags = [...analysis.possibleIdentifyingDetails, ...analysis.possibleAbusiveContent];
    if (safetyFlags.length) {
      return NextResponse.json({ error: 'The Final Cut changed or still contains a safety indicator. Review it before submitting.', flags: safetyFlags }, { status: 422 });
    }

    const { data: existingProfile, error: profileReadError } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (profileReadError) throw profileReadError;

    let profileReady = Boolean(existingProfile);
    if (!profileReady) {
      for (let attempt = 0; attempt < 12 && !profileReady; attempt += 1) {
        const hrtId = await allocateHrtId(async (candidate) => {
          const { data } = await admin.from('profiles').select('id').eq('hrt_id', candidate).maybeSingle();
          return Boolean(data);
        }, 12);
        const insertedProfile = await admin.from('profiles').insert({
          id: user.id,
          hrt_id: hrtId,
          private_email: user.email,
        });
        if (!insertedProfile.error) {
          profileReady = true;
          break;
        }
        if (insertedProfile.error.code !== '23505') throw insertedProfile.error;
        const { data: racedProfile } = await admin.from('profiles').select('id').eq('id', user.id).maybeSingle();
        profileReady = Boolean(racedProfile);
      }
      if (!profileReady) throw new Error('Unable to create a private CorporateX profile.');
    } else {
      const { error: profileUpdateError } = await admin.from('profiles').update({ private_email: user.email }).eq('id', user.id);
      if (profileUpdateError) throw profileUpdateError;
    }

    const normalized = input.context.companyName.trim().toLowerCase();
    let { data: company, error: companyReadError } = await admin
      .from('companies')
      .select('id')
      .eq('normalized_name', normalized)
      .maybeSingle();
    if (companyReadError) throw companyReadError;

    if (!company) {
      const baseSlug = slugify(input.context.companyName);
      let created = await admin.from('companies').insert({
        normalized_name: normalized,
        display_name: input.context.companyName.trim(),
        slug: baseSlug,
      }).select('id').single();

      if (created.error?.code === '23505') {
        const retry = await admin.from('companies').insert({
          normalized_name: normalized,
          display_name: input.context.companyName.trim(),
          slug: `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`,
        }).select('id').single();
        created = retry;
      }
      if (created.error || !created.data) throw created.error || new Error('Unable to create company record.');
      company = created.data;
    }
    if (!company) throw new Error('Unable to resolve company record.');

    const inserted = await admin.from('experiences').insert({
      profile_id: user.id,
      company_id: company.id,
      broad_function: input.context.broadFunction || null,
      broad_region: input.context.broadRegion,
      approximate_tenure: input.context.approximateTenure,
      work_arrangement: input.context.workArrangement,
      main_reason: input.ending,
      would_join_again: input.finalCut.beats.looking_back || null,
      story_path: 'guided',
      status: 'draft',
      approved_headline: input.finalCut.headline,
      approved_summary: input.finalCut.summary,
    }).select('id').single();
    if (inserted.error || !inserted.data) throw inserted.error || new Error('Unable to create story record.');
    createdExperienceId = inserted.data.id;

    if (guided.length) {
      const storedAnswers = await admin.from('guided_answers').insert(guided.map((row) => ({ ...row, experience_id: createdExperienceId })));
      if (storedAnswers.error) throw storedAnswers.error;
    }

    const awaitingAnalysis = await admin.from('experiences').update({ status: 'awaiting_ai_analysis' }).eq('id', createdExperienceId);
    if (awaitingAnalysis.error) throw awaitingAnalysis.error;

    const awaitingApproval = await admin.from('experiences').update({
      ai_analysis: analysis,
      approved_headline: input.finalCut.headline,
      approved_summary: input.finalCut.summary,
      status: 'awaiting_user_approval',
    }).eq('id', createdExperienceId);
    if (awaitingApproval.error) throw awaitingApproval.error;

    const highlights = HIGHLIGHT_FIELDS.flatMap(([key, category], sort) => {
      const content = String(analysis[key] || '').trim();
      return content ? [{ experience_id: createdExperienceId, category, content, contributor_approved: true, sort_order: sort }] : [];
    });
    if (highlights.length) {
      const storedHighlights = await admin.from('experience_highlights').insert(highlights);
      if (storedHighlights.error) throw storedHighlights.error;
    }

    if (analysis.suggestedLabels.length) {
      const storedLabels = await admin.from('experience_labels').insert(analysis.suggestedLabels.map((label) => ({ experience_id: createdExperienceId, label })));
      if (storedLabels.error) throw storedLabels.error;
    }

    const submitted = await admin.from('experiences').update({ status: 'pending_moderation' }).eq('id', createdExperienceId);
    if (submitted.error) throw submitted.error;

    return NextResponse.json({ id: createdExperienceId, status: 'pending_moderation' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (createdExperienceId) {
      const cleanup = await admin.from('experiences').delete().eq('id', createdExperienceId);
      if (cleanup.error) console.error('CorporateX partial-submission cleanup failed', { id: createdExperienceId, error: cleanup.error.message });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Submission failed' }, { status: 400 });
  }
}
