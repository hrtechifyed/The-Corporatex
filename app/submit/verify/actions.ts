'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { contributionSubmissionSchema } from '@/lib/schemas';
import { getSiteOrigin } from '@/lib/site-origin';
import { enforceRateLimit, requestIpFromHeaders } from '@/lib/rate-limit';
import { sendRecoverableSubmissionLink } from '@/lib/submission-auth-email';

const emailSchema = z.string().trim().email().max(320);

function errorRedirect(message: string): never {
  redirect(`/submit/verify?error=${encodeURIComponent(message)}`);
}

export async function requestSubmissionLink(formData: FormData) {
  const email = emailSchema.safeParse(String(formData.get('email') || ''));
  if (!email.success) errorRedirect('Enter a valid email address.');

  const parsedDraft = contributionSubmissionSchema.safeParse(JSON.parse(String(formData.get('draftPayload') || '{}')));
  if (!parsedDraft.success) errorRedirect(parsedDraft.error.issues[0]?.message || 'Return to Final Cut and review the contribution before verification.');

  const safety = parsedDraft.data.safety as { possibleIdentifyingDetails?: unknown[]; possibleAbusiveContent?: unknown[] } | undefined;
  if (!safety || (safety.possibleIdentifyingDetails?.length || 0) > 0 || (safety.possibleAbusiveContent?.length || 0) > 0) {
    errorRedirect('Run the safety check again before requesting verification.');
  }

  try {
    const requestHeaders = await headers();
    const ip = requestIpFromHeaders(requestHeaders);
    enforceRateLimit('submission-verification-email', `${ip}:${email.data.toLowerCase()}`, 5, 15 * 60 * 1000);

    const origin = await getSiteOrigin();
    await sendRecoverableSubmissionLink({ email: email.data, origin, draft: parsedDraft.data });
    redirect('/submit/verify?sent=1');
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : 'CorporateX could not send the verification email. Please try again.';
    console.error('CorporateX submission verification email failed:', message);
    errorRedirect(message);
  }
}
