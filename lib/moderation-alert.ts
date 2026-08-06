import { google } from 'googleapis';

export const DEFAULT_SAFETY_REVIEW_SUBJECT_PREFIX = '[CorporateX Safety Review]';

export type SafetyReviewAlertResult =
  | { status: 'sent'; messageId: string | null }
  | { status: 'not_configured' }
  | { status: 'failed'; error: string };

function cleanText(value: unknown) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeHeaderValue(value: string) {
  return cleanText(value).replace(/[\r\n]+/g, ' ');
}

function encodeMimeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(safeHeaderValue(value), 'utf8').toString('base64')}?=`;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildRawEmail(input: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const boundary = `corporatex_${crypto.randomUUID()}`;
  const lines = [
    `From: ${safeHeaderValue(input.from)}`,
    `To: ${safeHeaderValue(input.to)}`,
    `Subject: ${encodeMimeHeader(input.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(input.text, 'utf8').toString('base64'),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(input.html, 'utf8').toString('base64'),
    '',
    `--${boundary}--`,
    '',
  ];

  return encodeBase64Url(lines.join('\r\n'));
}

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
  const sender = cleanText(process.env.GMAIL_USER).toLowerCase();
  const recipient = cleanText(process.env.MODERATION_ALERT_EMAIL).toLowerCase();
  const clientId = cleanText(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = cleanText(process.env.GOOGLE_CLIENT_SECRET);
  const refreshToken = cleanText(process.env.GOOGLE_REFRESH_TOKEN);

  if (!sender || !recipient || !clientId || !clientSecret || !refreshToken) {
    return { status: 'not_configured' };
  }

  if (!isValidEmail(sender) || !isValidEmail(recipient)) {
    return { status: 'failed', error: 'GMAIL_USER or MODERATION_ALERT_EMAIL is not a valid email address.' };
  }

  const reviewUrl = moderationReviewUrl(input.submissionId);
  const subject = buildSafetyReviewSubject(input.submissionId);
  const indicatorCount = Math.max(1, input.flagCount);
  const reviewInstruction = reviewUrl
    ? `Open the protected moderation workspace: ${reviewUrl}`
    : 'Open the protected moderation workspace to review it.';
  const text = [
    'A CorporateX submission requires a safety review.',
    '',
    `Submission ID: ${input.submissionId}`,
    `Safety indicators: ${indicatorCount}`,
    '',
    'The story text and flagged expressions are intentionally excluded from this email.',
    reviewInstruction,
  ].join('\n');
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#09070d;color:#f7f2e8;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#17111f;border:1px solid #5d354f;border-radius:18px;overflow:hidden;">
      <tr><td style="height:6px;background:#f28a2e;"></td></tr>
      <tr><td style="padding:30px;">
        <p style="margin:0 0 8px;color:#f28a2e;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">CorporateX Safety Review</p>
        <h1 style="margin:0 0 20px;font-size:25px;line-height:1.25;color:#fff8eb;">A submission requires review</h1>
        <p style="margin:0 0 10px;color:#ddd2df;line-height:1.6;"><strong style="color:#fff8eb;">Submission ID:</strong> ${escapeHtml(input.submissionId)}</p>
        <p style="margin:0 0 22px;color:#ddd2df;line-height:1.6;"><strong style="color:#fff8eb;">Safety indicators:</strong> ${indicatorCount}</p>
        <p style="margin:0 0 22px;color:#bfb2c4;line-height:1.6;">The story text and flagged expressions are intentionally excluded from this email.</p>
        ${reviewUrl ? `<p style="margin:0;"><a href="${escapeHtml(reviewUrl)}" style="display:inline-block;padding:12px 18px;background:#f28a2e;color:#1b1011;text-decoration:none;font-weight:700;border-radius:999px;">Open protected review</a></p>` : '<p style="margin:0;color:#ddd2df;line-height:1.6;">Open the protected moderation workspace to review it.</p>'}
      </td></tr>
    </table>
  </body>
</html>`;

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmailApi = google.gmail({ version: 'v1', auth: oauth2Client });
    const raw = buildRawEmail({
      from: `"CorporateX Safety" <${sender}>`,
      to: recipient,
      subject,
      text,
      html,
    });
    const result = await gmailApi.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    return { status: 'sent', messageId: result.data.id || null };
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message : 'Unknown Gmail API error' };
  }
}
