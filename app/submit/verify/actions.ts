'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sendCorporateXAuthEmail } from '@/lib/auth-email';
import { getSiteOrigin } from '@/lib/site-origin';

const emailSchema = z.string().trim().email().max(320);

export async function requestSubmissionLink(formData: FormData) {
  const parsed = emailSchema.safeParse(String(formData.get('email') || ''));
  if (!parsed.success) redirect('/submit/verify?error=Enter%20a%20valid%20email%20address.');

  const origin = await getSiteOrigin();
  const result = await sendCorporateXAuthEmail({
    email: parsed.data,
    next: '/submit/finish',
    origin,
    purpose: 'submission',
  });

  if (result.status !== 'sent') {
    console.error('CorporateX submission verification email failed:', result.error);
    redirect('/submit/verify?error=CorporateX%20could%20not%20send%20the%20verification%20email.%20Please%20try%20again.');
  }

  redirect('/submit/verify?sent=1');
}
