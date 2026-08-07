'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const emailSchema = z.string().trim().email().max(320);

export async function requestSubmissionLink(formData: FormData) {
  const parsed = emailSchema.safeParse(String(formData.get('email') || ''));
  if (!parsed.success) redirect('/submit/verify?error=Enter%20a%20valid%20email%20address.');

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/submit/finish')}`,
    },
  });

  if (error) redirect(`/submit/verify?error=${encodeURIComponent(error.message)}`);
  redirect('/submit/verify?sent=1');
}
