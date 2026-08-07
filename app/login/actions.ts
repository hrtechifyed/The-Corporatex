'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function safeNext(value: string) {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/account';
}

export async function login(form: FormData) {
  const email = String(form.get('email') || '').trim();
  const next = safeNext(String(form.get('next') || '/account'));
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect('/login?sent=1');
}
