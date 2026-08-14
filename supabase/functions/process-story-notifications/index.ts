import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const SITE = "https://hrtechifyed.github.io/The-Corporatex/";

function clean(value: unknown) { return String(value ?? "").trim(); }
function esc(value: unknown) { return clean(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }
function endingLabel(value: string) {
  const map: Record<string,string> = { "break-free":"Break Free", "next-act":"Next Act", "mixed-ending":"Mixed Ending", "pass-the-torch":"Pass the Torch" };
  return map[value] || "Workplace story";
}
function shell(eyebrow: string, heading: string, body: string, details: string, buttonLabel: string, buttonUrl: string) {
  return `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#050608;color:#fffaf0;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#0d0e10;border:1px solid rgba(246,200,79,.30);border-radius:20px;overflow:hidden"><tr><td style="height:6px;background:linear-gradient(90deg,#d8872d,#f6c84f,#ffd761)"></td></tr><tr><td style="padding:34px"><p style="margin:0 0 10px;color:#f6c84f;font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase">${esc(eyebrow)}</p><h1 style="margin:0 0 18px;font-size:28px;line-height:1.25;color:#fffaf0">${esc(heading)}</h1><p style="margin:0 0 18px;color:#d2ccc3;font-size:15px;line-height:1.75">${esc(body)}</p><div style="margin:20px 0;padding:16px;border-left:3px solid #f6c84f;background:rgba(246,200,79,.05);color:#c9c2b9;font-size:14px;line-height:1.7">${details}</div><p style="margin:24px 0"><a href="${esc(buttonUrl)}" style="display:inline-block;padding:14px 20px;border-radius:12px;background:#f6c84f;color:#17120a;text-decoration:none;font-weight:800">${esc(buttonLabel)} →</a></p><p style="margin:0;color:#8e877f;font-size:12px;line-height:1.65">Your contributor email is private and never appears with a published CorporateX story.</p><div style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(255,255,255,.08)"><p style="margin:0 0 4px;color:#fffaf0;font-size:14px;font-weight:800">CorporateX <span style="color:#f6c84f">by HRTechify</span></p><p style="margin:0;color:#8e877f;font-size:12px">Not a score. A sequence. · People · Technology · Growth</p></div></td></tr></table></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const gmailUser = clean(Deno.env.get("GMAIL_USER") || "hrtechifyed@gmail.com");
  const gmailPassword = clean(Deno.env.get("GMAIL_APP_PASSWORD"));
  const moderationEmail = clean(Deno.env.get("MODERATION_ALERT_EMAIL") || "hrtechifyed@gmail.com");
  const smtpHost = clean(Deno.env.get("SMTP_HOST") || "smtp.gmail.com");
  const smtpPort = Number(Deno.env.get("SMTP_PORT") || "587");
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Supabase service configuration missing" }), { status: 500, headers: jsonHeaders });
  if (!gmailUser || !gmailPassword) return new Response(JSON.stringify({ error: "CorporateX transactional email is not configured yet" }), { status: 503, headers: jsonHeaders });

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const transport = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: gmailUser, pass: gmailPassword } });

  await admin.from("story_notification_jobs").update({ status: "failed", last_error: "Previous email attempt did not complete" }).eq("status", "processing").lt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

  const { data: jobs, error: jobsError } = await admin.from("story_notification_jobs").select("id,experience_id,kind,status,attempts").in("status", ["pending","failed"]).lt("attempts", 5).order("created_at", { ascending: true }).limit(12);
  if (jobsError) return new Response(JSON.stringify({ error: jobsError.message }), { status: 500, headers: jsonHeaders });

  let sent = 0;
  let failed = 0;
  for (const job of jobs || []) {
    const claimed = await admin.from("story_notification_jobs").update({ status: "processing", attempts: Number(job.attempts || 0) + 1, last_error: null }).eq("id", job.id).in("status", ["pending","failed"]).select("id").maybeSingle();
    if (!claimed.data) continue;
    try {
      const { data: exp, error: expError } = await admin.from("experiences").select("id,profile_id,status,approved_headline,ending_type,broad_region,broad_function,companies(display_name)").eq("id", job.experience_id).single();
      if (expError || !exp) throw expError || new Error("Story not found");
      const { data: profile } = await admin.from("profiles").select("private_email").eq("id", exp.profile_id).maybeSingle();
      const { count: beatCount } = await admin.from("guided_answers").select("experience_id", { count: "exact", head: true }).eq("experience_id", exp.id);
      const { data: moderation } = await admin.from("moderation_actions").select("action,contributor_message,created_at").eq("experience_id", exp.id).not("contributor_message", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
      const companies = exp.companies as unknown as { display_name?: string } | Array<{ display_name?: string }> | null;
      const company = Array.isArray(companies) ? companies[0]?.display_name : companies?.display_name;
      const safeCompany = clean(company) || "the employer you described";
      const ending = endingLabel(clean(exp.ending_type));
      const shortId = exp.id.replace(/-/g, "").slice(0, 8).toUpperCase();
      const accountUrl = `${SITE}account.html?tab=submissions`;
      const revisionUrl = `${SITE}submission-changes.html?id=${encodeURIComponent(exp.id)}`;
      const moderationUrl = `${SITE}moderation.html?id=${encodeURIComponent(exp.id)}`;
      const publicUrl = `${SITE}story-detail.html?id=${encodeURIComponent(exp.id)}`;
      const contributorMessage = clean(moderation?.contributor_message) || "Please review the requested changes in My Space.";

      let to = "";
      let subject = "";
      let text = "";
      let html = "";

      if (job.kind === "submission_admin" || job.kind === "resubmission_admin") {
        const revised = job.kind === "resubmission_admin";
        to = moderationEmail;
        subject = revised ? `[CorporateX] Updated story ready for moderation — ${shortId}` : `[CorporateX] New story submitted for moderation — ${shortId}`;
        text = `${revised ? "An updated" : "A new"} CorporateX workplace story is ready for moderation.\n\nSubmission: ${shortId}\nEmployer: ${safeCompany}\nEnding: ${ending}\nStory Beats answered: ${beatCount || 0}\nRegion: ${clean(exp.broad_region) || "Not supplied"}\n\nRaw contributor text is intentionally not copied into email.\n\nReview: ${moderationUrl}\n\n— CorporateX by HRTechify`;
        html = shell(revised ? "Updated moderation item" : "New moderation item", revised ? "A revised CorporateX story is ready for review." : "A new CorporateX story is ready for review.", revised ? "The contributor completed the requested changes and resubmitted the story." : "A contributor completed the guided story flow and submitted it for private moderation.", `<strong style="color:#fffaf0">Submission ${esc(shortId)}</strong><br>Employer: ${esc(safeCompany)}<br>Ending: ${esc(ending)}<br>Story Beats answered: ${beatCount || 0}<br>Region: ${esc(exp.broad_region || "Not supplied")}<br><br><span style="color:#8e877f">Raw story text is intentionally excluded from this email.</span>`, "Review submission", moderationUrl);
      } else if (job.kind === "submission_contributor" || job.kind === "resubmission_contributor") {
        if (!profile?.private_email) throw new Error("Contributor email unavailable");
        const revised = job.kind === "resubmission_contributor";
        to = profile.private_email;
        subject = revised ? "CorporateX received your updated story — back in review" : "CorporateX received your story — now in review";
        text = revised ? `We received your updated CorporateX story about ${safeCompany}. It is back in private moderation.\n\nTrack it in My Space: ${accountUrl}\n\n— CorporateX by HRTechify\nNot a score. A sequence.` : `Thank you for sharing your workplace experience with CorporateX.\n\nWe received your story about ${safeCompany}. You chose “${ending}” and completed ${beatCount || 0} Story Beat${Number(beatCount) === 1 ? "" : "s"}.\n\nWhat happens next:\n1. Your story stays private while a moderator reviews it for safety, privacy and clarity.\n2. Your email address is never published with the story.\n3. If approved, the story appears in Stories and we email you again.\n4. If a change is needed, your submission remains private while you review the request.\n\nTrack it in My Space: ${accountUrl}\n\n— CorporateX by HRTechify\nNot a score. A sequence.`;
        html = shell(revised ? "Story resubmitted" : "Story received", revised ? "Your updated CorporateX story is back in private review." : "Your CorporateX story is now in private review.", revised ? "We received the changes you made. HRTechify will review the updated version next." : `Thank you for sharing your workplace experience. We received your story about ${safeCompany}.`, revised ? `Employer: ${esc(safeCompany)}<br>Status: Back in moderation<br><br>You do not need to do anything unless another change is requested.` : `<strong style="color:#fffaf0">What you submitted</strong><br>Ending: ${esc(ending)}<br>Story Beats answered: ${beatCount || 0}<br><br><strong style="color:#fffaf0">What happens next</strong><br>1. A moderator reviews it for safety, privacy and clarity.<br>2. Your email never appears publicly.<br>3. If approved, it appears in Stories and we email you again.<br>4. If changes are needed, the story stays private while you review them.`, "Track in My Space", accountUrl);
      } else if (job.kind === "changes_requested_contributor") {
        if (!profile?.private_email) throw new Error("Contributor email unavailable");
        to = profile.private_email;
        subject = "CorporateX needs a small change before we can publish your story";
        text = `HRTechify reviewed your CorporateX story about ${safeCompany} and requested a change before publication.\n\nRequested change:\n${contributorMessage}\n\nYour story remains private. Review and resubmit it here: ${revisionUrl}\n\n— CorporateX by HRTechify\nNot a score. A sequence.`;
        html = shell("Changes requested", "A small change is needed before your story can move forward.", `HRTechify reviewed your story about ${safeCompany}. It remains private while you make the requested update.`, `<strong style="color:#fffaf0">Requested change</strong><br>${esc(contributorMessage)}<br><br>After updating the relevant Story Beat, resubmit it to return the story to moderation.`, "Review requested changes", revisionUrl);
      } else if (job.kind === "rejected_contributor") {
        if (!profile?.private_email) throw new Error("Contributor email unavailable");
        to = profile.private_email;
        subject = "An update on your CorporateX story review";
        text = `HRTechify completed the review of your CorporateX story about ${safeCompany}. It will not be published in its current form.\n\nReview note:\n${contributorMessage}\n\nThe story remains private and is not visible in Stories.\n\nTrack it in My Space: ${accountUrl}\n\n— CorporateX by HRTechify`;
        html = shell("Moderation complete", "Your story will not be published in its current form.", `HRTechify completed the review of your story about ${safeCompany}. The story remains private.`, `<strong style="color:#fffaf0">Review note</strong><br>${esc(contributorMessage)}<br><br>The story is not visible in the public Stories archive.`, "Open My Space", accountUrl);
      } else if (job.kind === "published_contributor") {
        if (!profile?.private_email) throw new Error("Contributor email unavailable");
        if (exp.status !== "published") throw new Error("Story is not published");
        to = profile.private_email;
        subject = "Your CorporateX story is now published";
        text = `Your CorporateX story has passed moderation and is now visible in the public Stories archive.\n\nStory: ${clean(exp.approved_headline) || safeCompany}\nEmployer: ${safeCompany}\n\nView it: ${publicUrl}\n\nYour email address remains private and is not shown on the story.\n\nThank you for helping future candidates understand the sequence behind a workplace exit.\n\n— CorporateX by HRTechify\nNot a score. A sequence.`;
        html = shell("Moderation approved", "Your story is now part of the CorporateX archive.", "Your contribution passed moderation and is now visible to readers exploring workplace exit experiences.", `<strong style="color:#fffaf0">${esc(exp.approved_headline || safeCompany)}</strong><br>Employer: ${esc(safeCompany)}<br><br>Thank you for helping future candidates understand the sequence behind a workplace exit.`, "View published story", publicUrl);
      } else {
        throw new Error(`Unsupported notification kind: ${job.kind}`);
      }

      await transport.sendMail({ from: `"HRTechify · CorporateX" <${gmailUser}>`, to, subject, text, html });
      await admin.from("story_notification_jobs").update({ status: "sent", processed_at: new Date().toISOString(), last_error: null }).eq("id", job.id);
      sent += 1;
    } catch (error) {
      await admin.from("story_notification_jobs").update({ status: "failed", last_error: error instanceof Error ? error.message.slice(0, 500) : "Email delivery failed" }).eq("id", job.id);
      failed += 1;
      console.error("corporatex_story_email_failed", { job: job.id, kind: job.kind, error: error instanceof Error ? error.message : "unknown" });
    }
  }

  return new Response(JSON.stringify({ processed: (jobs || []).length, sent, failed }), { headers: jsonHeaders });
});
