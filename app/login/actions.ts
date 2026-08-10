'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sendCorporateXAuthEmail } from '@/lib/auth-email';
import { getSiteOrigin } from '@/lib/site-origin';

const emailSchema = z.string().trim().email().max(320);

function safeNext(value: string) {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/account';
}

export async function login(form: FormData) {
  const parsed = emailSchema.safeParse(String(form.get('email') || ''));
  if (!parsed.success) redirect('/login?error=Enter%20a%20valid%20email%20address.');

  const next = safeNext(String(form.get('next') || '/account'));
  const origin = await getSiteOrigin();
  const result = await sendCorporateXAuthEmail({
    email: parsed.data,
    next,
    origin,
    purpose: 'signin',
  });

  if (result.status !== 'sent') {
    console.error('CorporateX sign-in email failed:', result.error);
    redirect('/login?error=CorporateX%20could%20not%20send%20the%20sign-in%20email.%20Please%20try%20again.');
  }

  redirect('/login?sent=1');
}
