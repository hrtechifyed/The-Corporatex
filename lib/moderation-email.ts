import 'server-only';
import { google } from 'googleapis';

export type ModerationOutcome = 'publish' | 'request_changes' | 'reject' | 'unpublish';

function clean(value: unknown) { return value === null || value === undefined ? '' : String(value).trim(); }
function safeHeader(value: string) { return clean(value).replace(/[\r\n]+/g, ' '); }
function mime(value: string) { return `=?UTF-8?B?${Buffer.from(safeHeader(value), 'utf8').toString('base64')}?=`; }
function b64url(value: string) { return Buffer.from(value, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); }
function escapeHtml(value: string) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

function copyFor(action: ModerationOutcome) {
  if (action === 'publish') return { subject: 'Your CorporateX story is published', eyebrow: 'Publication confirmed', heading: 'Your story is now part of the public archive.', body: 'The moderator reviewed the exact public version and confirmed publication.' };
  if (action === 'request_changes') return { subject: 'CorporateX needs a small change to your story', eyebrow: 'Changes requested', heading: 'Your story is still private.', body: 'A moderator has asked for a change before publication. Sign in to My Stories to review the request and edit the contributor-approved Final Cut.' };
  if (action === 'unpublish') return { subject: 'Your CorporateX story has been withdrawn', eyebrow: 'Story withdrawn', heading: 'Your story is no longer public.', body: 'The story has been withdrawn from the public archive. Your private account record remains available according to the platform’s retention and deletion controls.' };
  return { subject: 'An update about your CorporateX story', eyebrow: 'Publication review complete', heading: 'Your story will not be published in its current form.', body: 'The story remains private and will not appear in the public archive.' };
}

export async function sendModerationOutcomeEmail(input: { to: string; action: ModerationOutcome; headline: string; privateReason?: string; accountUrl: string; publicUrl?: string }) {
  const sender = clean(process.env.GMAIL_USER).toLowerCase();
  const clientId = clean(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = clean(process.env.GOOGLE_CLIENT_SECRET);
  const refreshToken = clean(process.env.GOOGLE_REFRESH_TOKEN);
  const recipient = clean(input.to).toLowerCase();
  if (!sender || !clientId || !clientSecret || !refreshToken || !recipient) return { status: 'not_configured' as const };

  const copy = copyFor(input.action);
  const reason = input.privateReason?.trim() || '';
  const actionUrl = input.action === 'publish' && input.publicUrl ? input.publicUrl : input.accountUrl;
  const button = input.action === 'publish' ? 'View published story' : 'Open My Stories';
  const text = [copy.heading, '', copy.body, '', `Story: ${input.headline}`, reason ? `Moderator note: ${reason}` : '', '', `${button}: ${actionUrl}`, '', '— CorporateX by HRTechify', 'People · Technology · Growth'].filter(Boolean).join('\n');
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#050608;color:#fffaf0;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#0d0e10;border:1px solid rgba(246,200,79,.28);border-radius:20px;overflow:hidden;"><tr><td style="height:6px;background:linear-gradient(90deg,#d8872d,#f6c84f,#ffd761);"></td></tr><tr><td style="padding:34px;"><p style="margin:0 0 10px;color:#f6c84f;font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;">${escapeHtml(copy.eyebrow)}</p><h1 style="margin:0 0 18px;font-size:27px;line-height:1.25;color:#fffaf0;">${escapeHtml(copy.heading)}</h1><p style="margin:0 0 18px;color:#d2ccc3;font-size:15px;line-height:1.7;">${escapeHtml(copy.body)}</p><div style="margin:20px 0;padding:16px;border-left:3px solid #f6c84f;background:rgba(246,200,79,.05);"><strong style="color:#fffaf0;">${escapeHtml(input.headline)}</strong>${reason ? `<p style="margin:9px 0 0;color:#aaa39b;font-size:13px;line-height:1.6;">Moderator note: ${escapeHtml(reason)}</p>` : ''}</div><p style="margin:22px 0;"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:14px 20px;border-radius:12px;background:#f6c84f;color:#17120a;text-decoration:none;font-weight:800;">${escapeHtml(button)} →</a></p><p style="margin:0;color:#8e877f;font-size:12px;line-height:1.6;">Your private email address does not appear on public CorporateX stories.</p><div style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(255,255,255,.08);"><p style="margin:0 0 4px;color:#fffaf0;font-size:14px;font-weight:800;">CorporateX <span style="color:#f6c84f;">by HRTechify</span></p><p style="margin:0;color:#8e877f;font-size:12px;">People · Technology · Growth</p></div></td></tr></table></body></html>`;
  const boundary = `corporatex_moderation_${crypto.randomUUID()}`;
  const raw = b64url([
    `From: ${safeHeader(`"HRTechify · CorporateX" <${sender}>`)}`,
    `To: ${safeHeader(recipient)}`,
    `Subject: ${mime(copy.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`, '',
    `--${boundary}`, 'Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: base64', '', Buffer.from(text, 'utf8').toString('base64'), '',
    `--${boundary}`, 'Content-Type: text/html; charset="UTF-8"', 'Content-Transfer-Encoding: base64', '', Buffer.from(html, 'utf8').toString('base64'), '',
    `--${boundary}--`, '',
  ].join('\r\n'));

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmailApi = google.gmail({ version: 'v1', auth: oauth2Client });
    const result = await gmailApi.users.messages.send({ userId: 'me', requestBody: { raw } });
    console.info('corporatex_email_delivery', { purpose: 'moderation', action: input.action, status: 'sent', messageId: result.data.id || null });
    return { status: 'sent' as const, messageId: result.data.id || null };
  } catch (error) {
    console.error('corporatex_email_delivery', { purpose: 'moderation', action: input.action, status: 'failed', error: error instanceof Error ? error.message : 'unknown' });
    return { status: 'failed' as const };
  }
}
