'use server';

import { redirect } from 'next/navigation';
import { ownedExperience } from '@/lib/auth';
import { draftSchema } from '@/lib/schemas';
import { slugify } from '@/lib/slug';

export async function updateContext(id: string, form: FormData) {
  const input = draftSchema.parse(Object.fromEntries(form));
  const { supabase, experience } = await ownedExperience(id);
  if (!['draft', 'changes_requested'].includes(experience.status)) throw new Error('This story can no longer return to context editing.');

  const normalized = input.companyName.trim().toLowerCase();
  let { data: company } = await supabase.from('companies').select('id').eq('normalized_name', normalized).maybeSingle();
  if (!company) {
    const created = await supabase
      .from('companies')
      .insert({ normalized_name: normalized, display_name: input.companyName.trim(), slug: slugify(input.companyName) })
      .select('id')
      .single();
    if (created.error) throw created.error;
    company = created.data;
  }

  const { error } = await supabase
    .from('experiences')
    .update({
      company_id: company.id,
      broad_function: input.broadFunction || null,
      broad_region: input.broadRegion,
      approximate_tenure: input.approximateTenure,
      work_arrangement: input.workArrangement,
      main_reason: input.mainReason,
    })
    .eq('id', id);
  if (error) throw error;
  redirect(`/submit/${id}/guided`);
}
