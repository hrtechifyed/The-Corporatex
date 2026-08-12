import 'server-only';
import { google } from 'googleapis';
import { createAdminClient } from '@/lib/supabase/admin';
import { prepareSubmissionHandoff } from '@/lib/submission-handoff';
import type { ContributionDraft } from '@/lib/contribution-draft';

function clean(value: unknown) { return value === null || value === undefined ? '' : String(value).trim(); }
function safeHeader(value: string) { return clean(value).replace(/[\r\n]+/g, ' '); }
function mime(value: string) { return `=?UTF-8?B?${Buffer.from(safeHeader(value), 'utf8').toString('base64')}?=`; }
function b64url(value: string) { return Buffer.from(value, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); }
function escapeHtml(value: string) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

function rawEmail(input: { from: string; to: string; subject: string; text: string; html: string }) {
  const boundary = `corporatex_submission_${crypto.randomUUID()}`;
  return b64url([
    `From: ${safeHeader(input.from)}`,
    `To: ${safeHeader(input.to)}`,
    `Subject: ${mime(input.subject)}`,
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
  ].join('\r\n'));
}

export async function sendRecoverableSubmissionLink(input: { email: string; origin: string; draft: ContributionDraft }) {
  const sender = clean(process.env.GMAIL_USER).toLowerCase();
  const clientId = clean(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = clean(process.env.GOOGLE_CLIENT_SECRET);
  const refreshToken = clean(process.env.GOOGLE_REFRESH_TOKEN);
  const recipient = clean(input.email).toLowerCase();
  if (!sender || !clientId || !clientSecret || !refreshToken) throw new Error('HRTechify email delivery is not configured.');

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email: recipient });
  if (error) throw error;
  const tokenHash = data.properties?.hashed_token;
  const userId = data.user?.id;
  if (!tokenHash || !userId) throw new Error('CorporateX could not prepare a secure verification link.');

  // Persist the contributor-approved Final Cut privately before email delivery so the verification link
  // can be opened in another browser or device without losing the completed story.
  await prepareSubmissionHandoff(userId, recipient, input.draft);

  const verificationUrl = new URL('/auth/confirm', input.origin);
  verificationUrl.searchParams.set('token_hash', tokenHash);
  verificationUrl.searchParams.set('type', 'magiclink');
  verificationUrl.searchParams.set('next', `/submit/finish?id=${encodeURIComponent(input.draft.draftId)}`);

  const text = [
    'Thank you for trusting CorporateX with your story.',
    '',
    'Your contributor-approved Final Cut has been saved privately as a recoverable submission handoff. It is not public and has not entered moderation yet.',
    '',
    'Verify your email to submit the story into private review:',
    verificationUrl.toString(),
    '',
    'You can open this one-time link in another browser or device. CorporateX will recover the private submission after verification.',
    '',
    'Your email address remains private and never appears on the public story.',
    '',
    '— CorporateX by HRTechify',
    'People · Technology · Growth',
  ].join('\n');

  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#050608;color:#fffaf0;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#0d0e10;border:1px solid rgba(246,200,79,.28);border-radius:20px;overflow:hidden;"><tr><td style="height:6px;background:linear-gradient(90deg,#d8872d,#f6c84f,#ffd761);"></td></tr><tr><td style="padding:34px;"><p style="margin:0 0 10px;color:#f6c84f;font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;">CorporateX story verification</p><h1 style="margin:0 0 20px;font-size:28px;line-height:1.25;color:#fffaf0;">Thank you for trusting us with your story.</h1><p style="margin:0 0 18px;color:#d2ccc3;font-size:15px;line-height:1.75;">Your contributor-approved Final Cut has been saved privately so this one-time verification link can work even if your email opens in another browser or device.</p><p style="margin:0 0 18px;color:#aaa39b;font-size:13px;line-height:1.7;">This private handoff is not public and has not entered moderation yet. Your email address remains private.</p><p style="margin:6px 0 26px;"><a href="${escapeHtml(verificationUrl.toString())}" style="display:inline-block;padding:14px 20px;border-radius:12px;background:#f6c84f;color:#17120a;text-decoration:none;font-weight:800;">Verify my email &amp; submit my story →</a></p><p style="margin:0;color:#8e877f;font-size:12px;line-height:1.6;">This link is private and one-time use. If you did not request it, you can ignore this email.</p><div style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(255,255,255,.08);"><p style="margin:0 0 4px;color:#fffaf0;font-size:14px;font-weight:800;">CorporateX <span style="color:#f6c84f;">by HRTechify</span></p><p style="margin:0;color:#8e877f;font-size:12px;">People · Technology · Growth</p></div></td></tr></table></body></html>`;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmailApi = google.gmail({ version: 'v1', auth: oauth2Client });
  const result = await gmailApi.users.messages.send({
    userId: 'me',
    requestBody: { raw: rawEmail({ from: `"HRTechify · CorporateX" <${sender}>`, to: recipient, subject: 'Thank you for sharing your story — one last step', text, html }) },
  });
  console.info('corporatex_email_delivery', { purpose: 'submission', status: 'sent', messageId: result.data.id || null });
  return { status: 'sent' as const, messageId: result.data.id || null, handoffId: input.draft.draftId };
}
