import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const SITE = "https://hrtechifyed.github.io/The-Corporatex/";
const clean = (value: unknown) => String(value ?? "").trim();
const esc = (value: unknown) => clean(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");

function emailShell() {
  const accountUrl = `${SITE}account.html?tab=submissions`;
  return `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#050608;color:#fffaf0;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#0d0e10;border:1px solid rgba(246,200,79,.30);border-radius:20px;overflow:hidden"><tr><td style="height:6px;background:linear-gradient(90deg,#d8872d,#f6c84f,#ffd761)"></td></tr><tr><td style="padding:34px"><p style="margin:0 0 10px;color:#f6c84f;font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase">DELETION CONFIRMED</p><h1 style="margin:0 0 18px;font-size:28px;line-height:1.25;color:#fffaf0">Your CorporateX story has been permanently deleted.</h1><p style="margin:0 0 18px;color:#d2ccc3;font-size:15px;line-height:1.75">You asked CorporateX to delete one of your workplace stories. The deletion is complete.</p><div style="margin:20px 0;padding:16px;border-left:3px solid #f6c84f;background:rgba(246,200,79,.05);color:#c9c2b9;font-size:14px;line-height:1.7"><strong style="color:#fffaf0">What this means</strong><br>The story and its associated story data have been removed from CorporateX and cannot be restored.<br><br>If the story had been published, it is no longer available in Stories or on the CorporateX homepage.</div><p style="margin:24px 0"><a href="${esc(accountUrl)}" style="display:inline-block;padding:14px 20px;border-radius:12px;background:#f6c84f;color:#17120a;text-decoration:none;font-weight:800">Open My Space →</a></p><p style="margin:0;color:#8e877f;font-size:12px;line-height:1.65">Your CorporateX account remains active. Only the story you selected was deleted.</p><div style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(255,255,255,.08)"><p style="margin:0 0 4px;color:#fffaf0;font-size:14px;font-weight:800">CorporateX <span style="color:#f6c84f">by HRTechify</span></p><p style="margin:0;color:#8e877f;font-size:12px">Not a score. A sequence. · People · Technology · Growth</p></div></td></tr></table></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const gmailUser = clean(Deno.env.get("GMAIL_USER") || "hrtechifyed@gmail.com");
  const gmailPassword = clean(Deno.env.get("GMAIL_APP_PASSWORD"));
  const smtpHost = clean(Deno.env.get("SMTP_HOST") || "smtp.gmail.com");
  const smtpPort = Number(Deno.env.get("SMTP_PORT") || "587");
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Supabase service configuration missing" }), { status: 500, headers });
  if (!gmailUser || !gmailPassword) return new Response(JSON.stringify({ error: "CorporateX transactional email is not configured yet" }), { status: 503, headers });

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const transport = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: gmailUser, pass: gmailPassword } });

  await admin.from("story_deletion_email_jobs").update({ status: "failed", last_error: "Previous email attempt did not complete" }).eq("status", "processing").lt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());
  const { data: jobs, error: jobsError } = await admin.from("story_deletion_email_jobs").select("id,profile_id,deleted_experience_id,status,attempts").in("status", ["pending","failed"]).lt("attempts", 5).order("created_at", { ascending: true }).limit(20);
  if (jobsError) return new Response(JSON.stringify({ error: jobsError.message }), { status: 500, headers });

  let sent = 0;
  let failed = 0;
  for (const job of jobs || []) {
    const claimed = await admin.from("story_deletion_email_jobs").update({ status: "processing", attempts: Number(job.attempts || 0) + 1, last_error: null }).eq("id", job.id).in("status", ["pending","failed"]).select("id").maybeSingle();
    if (!claimed.data) continue;
    try {
      const { data: profile, error: profileError } = await admin.from("profiles").select("private_email").eq("id", job.profile_id).single();
      if (profileError || !profile?.private_email) throw profileError || new Error("Contributor email unavailable");
      const subject = "Your CorporateX story has been permanently deleted";
      const text = `Your CorporateX story deletion is complete.\n\nThe story and its associated story data have been removed from CorporateX and cannot be restored. If it had been published, it is no longer available in Stories or on the CorporateX homepage.\n\nYour CorporateX account remains active. Only the story you selected was deleted.\n\nMy Space: ${SITE}account.html?tab=submissions\n\n— CorporateX by HRTechify\nNot a score. A sequence.`;
      await transport.sendMail({ from: `"HRTechify · CorporateX" <${gmailUser}>`, to: profile.private_email, subject, text, html: emailShell() });
      await admin.from("story_deletion_email_jobs").delete().eq("id", job.id);
      sent += 1;
    } catch (error) {
      await admin.from("story_deletion_email_jobs").update({ status: "failed", last_error: error instanceof Error ? error.message.slice(0, 500) : "Email delivery failed" }).eq("id", job.id);
      failed += 1;
      console.error("corporatex_story_deletion_email_failed", { job: job.id, error: error instanceof Error ? error.message : "unknown" });
    }
  }

  return new Response(JSON.stringify({ processed: (jobs || []).length, sent, failed }), { headers });
});
