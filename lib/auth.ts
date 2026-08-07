import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';
import { allocateHrtId } from './identity';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/account');
  return { supabase, user };
}

async function ensureProfileRecord(user: { id: string; email?: string | null }) {
  const admin = createAdminClient();
  const { data: existing, error: readError } = await admin
    .from('profiles')
    .select('id,hrt_id,role')
    .eq('id', user.id)
    .maybeSingle();
  if (readError) throw readError;
  if (existing) return existing;
  if (!user.email) throw new Error('A verified email is required to create a CorporateX profile.');

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const hrtId = await allocateHrtId(async (candidate) => {
      const { data } = await admin.from('profiles').select('id').eq('hrt_id', candidate).maybeSingle();
      return Boolean(data);
    }, 12);
    const { data, error } = await admin
      .from('profiles')
      .insert({ id: user.id, hrt_id: hrtId, private_email: user.email })
      .select('id,hrt_id,role')
      .single();
    if (!error && data) return data;
    if (error?.code !== '23505') throw error;

    const { data: raced } = await admin.from('profiles').select('id,hrt_id,role').eq('id', user.id).maybeSingle();
    if (raced) return raced;
  }

  throw new Error('Unable to create a private CorporateX profile.');
}

export async function requireProfile() {
  const { supabase, user } = await requireUser();
  const profile = await ensureProfileRecord(user);
  return { supabase, user, profile };
}

export async function ownedExperience(id: string) {
  const { supabase, profile } = await requireProfile();
  const { data, error } = await supabase
    .from('experiences')
    .select('*,companies(display_name,slug)')
    .eq('id', id)
    .eq('profile_id', profile.id)
    .single();
  if (error || !data) throw new Error('Experience not found');
  return { supabase, profile, experience: data };
}

export async function requireModerator() {
  const ctx = await requireProfile();
  if (ctx.profile.role !== 'moderator') redirect('/account');
  return ctx;
}
