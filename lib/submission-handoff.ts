import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { allocateHrtId } from '@/lib/identity';
import { slugify } from '@/lib/slug';
import { SCENES } from '@/lib/types';
import type { ContributionDraft } from '@/lib/contribution-draft';

async function ensureProfile(userId: string, email: string) {
  const admin = createAdminClient();
  const { data: existing, error: readError } = await admin.from('profiles').select('id').eq('id', userId).maybeSingle();
  if (readError) throw readError;
  if (existing) {
    const { error } = await admin.from('profiles').update({ private_email: email }).eq('id', userId);
    if (error) throw error;
    return;
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const hrtId = await allocateHrtId(async (candidate) => {
      const { data } = await admin.from('profiles').select('id').eq('hrt_id', candidate).maybeSingle();
      return Boolean(data);
    }, 12);
    const inserted = await admin.from('profiles').insert({ id: userId, hrt_id: hrtId, private_email: email });
    if (!inserted.error) return;
    if (inserted.error.code !== '23505') throw inserted.error;
    const { data: raced } = await admin.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (raced) return;
  }
  throw new Error('Unable to create a private CorporateX profile.');
}

async function resolveCompany(name: string) {
  const admin = createAdminClient();
  const normalized = name.trim().toLowerCase();
  const { data: existing, error } = await admin.from('companies').select('id').eq('normalized_name', normalized).maybeSingle();
  if (error) throw error;
  if (existing) return existing.id as string;

  const baseSlug = slugify(name);
  let created = await admin.from('companies').insert({ normalized_name: normalized, display_name: name.trim(), slug: baseSlug }).select('id').single();
  if (created.error?.code === '23505') {
    created = await admin.from('companies').insert({ normalized_name: normalized, display_name: name.trim(), slug: `${baseSlug}-${crypto.randomUUID().slice(0, 6)}` }).select('id').single();
  }
  if (created.error || !created.data) throw created.error || new Error('Unable to create company record.');
  return created.data.id as string;
}

export async function prepareSubmissionHandoff(userId: string, email: string, draft: ContributionDraft) {
  const admin = createAdminClient();
  await ensureProfile(userId, email);
  const companyId = await resolveCompany(draft.context.companyName);

  const { data: existing, error: existingError } = await admin
    .from('experiences')
    .select('id,profile_id,status')
    .eq('id', draft.draftId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing && existing.profile_id !== userId) throw new Error('This draft is already associated with another private account.');
  if (existing && !['draft', 'awaiting_ai_analysis', 'awaiting_user_approval'].includes(existing.status)) return draft.draftId;

  const experience = {
    profile_id: userId,
    company_id: companyId,
    broad_function: draft.context.broadFunction || null,
    broad_region: draft.context.broadRegion,
    approximate_tenure: draft.context.approximateTenure,
    work_arrangement: draft.context.workArrangement,
    main_reason: draft.ending,
    would_join_again: draft.finalCut?.beats.looking_back || null,
    story_path: 'guided',
    approved_headline: draft.finalCut?.headline,
    approved_summary: draft.finalCut?.summary,
  };

  if (existing) {
    if (existing.status !== 'draft') throw new Error('This contribution has already started the private review workflow.');
    const { error } = await admin.from('experiences').update(experience).eq('id', draft.draftId);
    if (error) throw error;
  } else {
    const { error } = await admin.from('experiences').insert({ id: draft.draftId, ...experience, status: 'draft' });
    if (error) throw error;
  }

  const guided: Array<{ experience_id: string; question_key: string; answer: string; sort_order: number }> = SCENES.flatMap(([key], index) => {
    const answer = String(draft.finalCut?.beats[key] || '').trim();
    return answer ? [{ experience_id: draft.draftId, question_key: key, answer, sort_order: index * 10 }] : [];
  });
  if (draft.finalCut?.technologyFollowUp.trim()) {
    guided.push({ experience_id: draft.draftId, question_key: 'shift_technology_followup', answer: draft.finalCut.technologyFollowUp.trim(), sort_order: 31 });
  }
  draft.shiftTopics.forEach((topic, index) => {
    guided.push({ experience_id: draft.draftId, question_key: `shift_topic:${topic}`, answer: topic, sort_order: 40 + index });
  });

  const removedAnswers = await admin.from('guided_answers').delete().eq('experience_id', draft.draftId);
  if (removedAnswers.error) throw removedAnswers.error;
  if (guided.length) {
    const storedAnswers = await admin.from('guided_answers').insert(guided);
    if (storedAnswers.error) throw storedAnswers.error;
  }

  // Handoffs are private drafts. Public-facing derivative records are generated only after verified finalization.
  const removedHighlights = await admin.from('experience_highlights').delete().eq('experience_id', draft.draftId);
  if (removedHighlights.error) throw removedHighlights.error;
  const removedLabels = await admin.from('experience_labels').delete().eq('experience_id', draft.draftId);
  if (removedLabels.error) throw removedLabels.error;

  return draft.draftId;
}
