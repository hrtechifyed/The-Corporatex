import 'server-only';
import { google } from 'googleapis';
import { createAdminClient } from '@/lib/supabase/admin';

export type CorporateXAuthPurpose = 'submission' | 'signin';

export type CorporateXAuthEmailResult =
  | { status: 'sent'; messageId: string | null }
  | { status: 'not_configured'; error: string }
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
  const boundary = `corporatex_auth_${crypto.randomUUID()}`;
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

function copyForPurpose(purpose: CorporateXAuthPurpose) {
  return purpose === 'submission'
    ? {
        subject: 'Verify your email to submit your CorporateX story',
        eyebrow: 'CorporateX story verification',
        heading: 'One last step before submission',
        intro: 'Your story is ready. Verify this email address to save it and send it into the private CorporateX review path.',
        button: 'Verify email & submit story',
      }
    : {
        subject: 'Your CorporateX sign-in link',
        eyebrow: 'CorporateX private sign-in',
        heading: 'Continue to your private CorporateX account',
        intro: 'Use this one-time link to sign in without a password.',
        button: 'Sign in to CorporateX',
      };
}

export async function sendCorporateXAuthEmail(input: {
  email: string;
  next: string;
  origin: string;
  purpose: CorporateXAuthPurpose;
}): Promise<CorporateXAuthEmailResult> {
  const sender = cleanText(process.env.GMAIL_USER).toLowerCase();
  const clientId = cleanText(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = cleanText(process.env.GOOGLE_CLIENT_SECRET);
  const refreshToken = cleanText(process.env.GOOGLE_REFRESH_TOKEN);
  const recipient = cleanText(input.email).toLowerCase();

  if (!sender || !clientId || !clientSecret || !refreshToken) {
    return { status: 'not_configured', error: 'HRTechify email delivery is not configured.' };
  }
  if (!isValidEmail(sender) || !isValidEmail(recipient)) {
    return { status: 'failed', error: 'The sender or recipient email address is invalid.' };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: recipient,
  });
  if (error) return { status: 'failed', error: error.message };

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) return { status: 'failed', error: 'Supabase did not return a verification token.' };

  const verificationUrl = new URL('/auth/confirm', input.origin);
  verificationUrl.searchParams.set('token_hash', tokenHash);
  verificationUrl.searchParams.set('type', 'magiclink');
  verificationUrl.searchParams.set('next', input.next);

  const copy = copyForPurpose(input.purpose);
  const text = [
    copy.heading,
    '',
    copy.intro,
    '',
    verificationUrl.toString(),
    '',
    'This link is private and one-time use. If you did not request it, you can ignore this email.',
  ].join('\n');
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#050608;color:#fffaf0;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#0d0e10;border:1px solid rgba(246,200,79,.28);border-radius:20px;overflow:hidden;">
      <tr><td style="height:6px;background:linear-gradient(90deg,#d8872d,#f6c84f,#ffd761);"></td></tr>
      <tr><td style="padding:34px;">
        <p style="margin:0 0 10px;color:#f6c84f;font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;">${escapeHtml(copy.eyebrow)}</p>
        <h1 style="margin:0 0 18px;font-size:27px;line-height:1.25;color:#fffaf0;">${escapeHtml(copy.heading)}</h1>
        <p style="margin:0 0 24px;color:#bdb7b0;font-size:15px;line-height:1.7;">${escapeHtml(copy.intro)}</p>
        <p style="margin:0 0 24px;"><a href="${escapeHtml(verificationUrl.toString())}" style="display:inline-block;padding:13px 20px;border-radius:12px;background:#f6c84f;color:#17120a;text-decoration:none;font-weight:800;">${escapeHtml(copy.button)} →</a></p>
        <p style="margin:0;color:#77716d;font-size:12px;line-height:1.6;">This link is private and one-time use. If you did not request it, you can ignore this email.</p>
      </td></tr>
    </table>
  </body>
</html>`;

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmailApi = google.gmail({ version: 'v1', auth: oauth2Client });
    const raw = buildRawEmail({
      from: `"HRTechify · CorporateX" <${sender}>`,
      to: recipient,
      subject: copy.subject,
      text,
      html,
    });
    const result = await gmailApi.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
    return { status: 'sent', messageId: result.data.id || null };
  } catch (reason) {
    return { status: 'failed', error: reason instanceof Error ? reason.message : 'Unknown Gmail API error' };
  }
}
