export const DEFAULT_SAFETY_REVIEW_SUBJECT_PREFIX = '[CorporateX Safety Review]';

export type SafetyReviewAlertResult =
  | { status: 'sent'; messageId: string | null }
  | { status: 'not_configured' }
  | { status: 'failed'; error: string };

export function buildSafetyReviewSubject(submissionId: string) {
  const prefix = process.env.MODERATION_ALERT_SUBJECT_PREFIX?.trim()
    || DEFAULT_SAFETY_REVIEW_SUBJECT_PREFIX;
  const shortId = submissionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'UNKNOWN';
  return `${prefix} Submission ${shortId} requires review`;
}

function moderationReviewUrl(submissionId: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  return siteUrl ? `${siteUrl}/moderation?experience=${encodeURIComponent(submissionId)}` : null;
}

export async function sendSafetyReviewAlert(input: {
  submissionId: string;
  flagCount: number;
}): Promise<SafetyReviewAlertResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MODERATION_FROM_EMAIL?.trim();
  const to = process.env.MODERATION_ALERT_EMAIL?.trim();

  if (!apiKey || !from || !to) return { status: 'not_configured' };

  const reviewUrl = moderationReviewUrl(input.submissionId);
  const subject = buildSafetyReviewSubject(input.submissionId);
  const text = [
    'A CorporateX submission requires a safety review.',
    '',
    `Submission ID: ${input.submissionId}`,
    `Safety indicators: ${Math.max(1, input.flagCount)}`,
    '',
    'The story text and flagged expressions are intentionally excluded from this email.',
    reviewUrl ? `Open the protected moderation workspace: ${reviewUrl}` : 'Open the protected moderation workspace to review it.',
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return { status: 'failed', error: `Email provider returned ${response.status}: ${detail.slice(0, 300)}` };
    }

    const payload = await response.json() as { id?: string };
    return { status: 'sent', messageId: payload.id || null };
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message : 'Unknown email error' };
  }
}
