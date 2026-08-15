import { createClient } from "npm:@supabase/supabase-js@2";
import { City, Country, State } from "npm:country-state-city@3.2.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://hrtechifyed.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const labelRules: Array<[string, RegExp]> = [
  ["Leadership", /\b(?:manager|management|leader|leadership|boss)\b/i],
  ["Workload", /\b(?:workload|overtime|burnout|long hours|deadline)\b/i],
  ["Growth", /\b(?:promotion|growth|career|learning|development)\b/i],
  ["Compensation", /\b(?:pay|salary|compensation|bonus|benefits)\b/i],
  ["Wellbeing", /\b(?:wellbeing|well-being|stress|mental health|burnout)\b/i],
  ["Culture", /\b(?:culture|team|colleague|collaboration)\b/i],
  ["Change", /\b(?:restructure|reorganisation|reorganization|layoff|merger|change)\b/i],
  ["AI", /\b(?:AI|automation|artificial intelligence|machine learning)\b/i],
];

const safetyRules: Array<[string, RegExp]> = [
  ["Possible direct racial or identity-based slur", /\b(?:nigg(?:er|a)|kike|chink|paki|spic|gook|faggot|tranny)\b/i],
  ["Possible abusive slang or targeted personal attack", /\b(?:idiot|moron|retard(?:ed)?|stupid|bastard|asshole|bitch|whore)\b/i],
  ["Possible threat or violent expression", /\b(?:kill(?:ed|ing)?|murder(?:ed|ing)?|shoot(?:ing)?|stab(?:bed|bing)?|threaten(?:ed|ing)?|bomb)\b/i],
  ["Possible self-harm expression", /\b(?:suicid(?:e|al)|self[-\s]?harm|kill\s+myself|end\s+my\s+life|hurt\s+myself)\b/i],
];

const endings = new Set(["break-free", "next-act", "mixed-ending", "pass-the-torch"]);
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: corsHeaders }); }
function clean(value: unknown, max = 12000) { return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max); }
function normalize(value: unknown) { return clean(value, 240).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "company"; }

function parseDepartureMonth(value: unknown) {
  const raw = clean(value, 10);
  if (!raw) return null;
  const match = raw.match(/^(\d{4})-(\d{2})-01$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  const date = new Date(Date.UTC(year, month - 1, 1));
  const now = new Date();
  const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  if (date > currentMonth) return null;
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function validateGlobalLocation(selection: Record<string, unknown> | null | undefined) {
  const kind = clean(selection?.kind, 20).toLowerCase();
  if (kind === "remote") return { displayName: "Remote", category: "remote" };
  if (kind === "other") return { displayName: "Other", category: "other" };
  if (kind !== "city") return null;

  const cityName = clean(selection?.city, 160);
  const countryCode = clean(selection?.countryCode, 4).toUpperCase();
  const stateCode = clean(selection?.stateCode, 12).toUpperCase();
  if (!cityName || !countryCode) return null;

  const country = Country.getCountryByCode(countryCode);
  if (!country) return null;
  const state = stateCode ? State.getStateByCodeAndCountry(stateCode, countryCode) : undefined;
  const candidates = stateCode ? City.getCitiesOfState(countryCode, stateCode) : City.getCitiesOfCountry(countryCode);
  const match = candidates.find((city) => normalize(city.name) === normalize(cityName));
  if (!match) return null;
  const parts = [match.name, state?.name, country.name].filter(Boolean);
  return { displayName: [...new Set(parts)].join(", "), category: "city" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "Create or sign in to your CorporateX account before submitting." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: "Submission service is not configured." }, 500);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Your account session has expired. Please sign in again." }, 401);

    const input = await req.json();
    const draftId = clean(input?.draftId, 64);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(draftId)) return json({ error: "Invalid draft identifier." }, 422);

    const company = clean(input?.context?.company, 180);
    const team = clean(input?.context?.team, 140);
    const role = clean(input?.context?.role || input?.context?.team, 140);
    const departureMonthInput = clean(input?.context?.departureMonth, 10);
    const departureMonth = parseDepartureMonth(departureMonthInput);
    let location = clean(input?.context?.location, 240);
    const ending = clean(input?.ending, 40);
    if (!endings.has(ending)) return json({ error: "Choose one of the four story endings before submitting." }, 422);
    if (departureMonthInput && !departureMonth) return json({ error: "Enter a valid month and year you left in MM/YY format." }, 422);

    const chapters = Array.isArray(input?.chapters) ? input.chapters : [];
    const answered = chapters.map((chapter: Record<string, unknown>, index: number) => ({
      key: clean(chapter.id ?? chapter.key ?? `beat_${index}`, 80),
      title: clean(chapter.title, 160),
      answer: clean(chapter.response ?? chapter.answer, 12000),
      sortOrder: Number.isFinite(Number(chapter.number)) ? Number(chapter.number) : index + 1,
    })).filter((chapter: { answer: string }) => chapter.answer.length > 0);

    if (!company || !location) return json({ error: "Company and location are required." }, 422);
    if (!answered.length) return json({ error: "Answer at least one Story Beat before submitting." }, 422);

    const storyText = answered.map((chapter: { answer: string }) => chapter.answer).join(" ");
    const identifying: string[] = [];
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(storyText)) identifying.push("Possible email address");
    if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(storyText)) identifying.push("Possible phone number");
    if (/\b(?:https?:\/\/|www\.)\S+/i.test(storyText)) identifying.push("Possible web address");
    const safetyFlags = safetyRules.filter(([, pattern]) => pattern.test(storyText)).map(([label]) => label);
    if (identifying.length || safetyFlags.length) return json({ error: "Review the Final Cut before submitting.", flags: [...identifying, ...safetyFlags] }, 422);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const selectedLocation = validateGlobalLocation(input?.locationSelection);
    if (selectedLocation) {
      location = selectedLocation.displayName;
      const registered = await admin.from("story_locations").upsert({
        display_name: location,
        category: selectedLocation.category,
        priority: selectedLocation.category === "city" ? 100 : selectedLocation.category === "remote" ? 1 : 2,
        is_active: true,
      }, { onConflict: "display_name" });
      if (registered.error) throw registered.error;
    } else {
      const { data: knownLocation, error: knownLocationError } = await admin.from("story_locations")
        .select("display_name,category")
        .eq("display_name", location)
        .eq("is_active", true)
        .maybeSingle();
      if (knownLocationError) throw knownLocationError;
      if (!knownLocation) return json({ error: "Choose a valid city, Remote, or Other from the location suggestions." }, 422);
      location = knownLocation.display_name;
    }

    const { data: existing } = await admin.from("experiences").select("id,profile_id,status").eq("id", draftId).maybeSingle();
    if (existing) {
      if (existing.profile_id !== user.id) return json({ error: "This draft belongs to another account." }, 403);
      if (["pending_moderation", "published"].includes(existing.status)) return json({ id: existing.id, status: existing.status, idempotent: true, emailQueued: true });
    }

    const normalizedName = company.toLowerCase().replace(/\s+/g, " ").trim();
    let { data: companyRow } = await admin.from("companies").select("id,display_name").eq("normalized_name", normalizedName).maybeSingle();
    if (!companyRow) {
      const baseSlug = slugify(company);
      const candidateSlug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
      const created = await admin.from("companies").insert({ normalized_name: normalizedName, display_name: company, slug: candidateSlug }).select("id,display_name").single();
      if (created.error) throw created.error;
      companyRow = created.data;
    }

    const firstAnswer = answered[0]?.answer || "";
    const summary = clean(answered.map((chapter: { answer: string }) => chapter.answer).join(" "), 1200);
    const headline = clean(firstAnswer, 150) || `A workplace experience at ${company}`;
    const labels = labelRules.filter(([, pattern]) => pattern.test(storyText)).map(([label]) => label).slice(0, 12);
    const analysis = { suggestedHeadline: headline, shortSummary: summary, suggestedLabels: labels, possibleIdentifyingDetails: identifying, possibleAbusiveContent: safetyFlags, possibleUnsupportedClaims: [], seriousTopic: false };

    const employmentContext = {
      broad_function: role || team || null,
      role_title: role || null,
      departure_month: departureMonth,
    };

    if (!existing) {
      const inserted = await admin.from("experiences").insert({
        id: draftId,
        profile_id: user.id,
        company_id: companyRow.id,
        original_text: clean(answered.map((chapter: { title: string; answer: string }) => `${chapter.title}: ${chapter.answer}`).join("\n\n"), 30000),
        approved_headline: headline,
        approved_summary: summary,
        ...employmentContext,
        broad_region: location,
        story_path: "guided",
        ending_type: ending,
        status: "draft",
      });
      if (inserted.error) throw inserted.error;
      const answerRows = answered.map((chapter: { key: string; answer: string; sortOrder: number }) => ({ experience_id: draftId, question_key: chapter.key, answer: chapter.answer, sort_order: chapter.sortOrder }));
      const storedAnswers = await admin.from("guided_answers").insert(answerRows);
      if (storedAnswers.error) throw storedAnswers.error;
    } else {
      const updated = await admin.from("experiences").update({ ending_type: ending, broad_region: location, ...employmentContext }).eq("id", draftId);
      if (updated.error) throw updated.error;
    }

    const toAnalysis = await admin.from("experiences").update({ status: "awaiting_ai_analysis" }).eq("id", draftId).eq("status", "draft");
    if (toAnalysis.error) throw toAnalysis.error;
    const toApproval = await admin.from("experiences").update({ ai_analysis: analysis, approved_headline: headline, approved_summary: summary, status: "awaiting_user_approval" }).eq("id", draftId).eq("status", "awaiting_ai_analysis");
    if (toApproval.error) throw toApproval.error;

    if (labels.length) {
      await admin.from("experience_labels").delete().eq("experience_id", draftId);
      const storedLabels = await admin.from("experience_labels").insert(labels.map((label) => ({ experience_id: draftId, label }))); if (storedLabels.error) throw storedLabels.error;
    }

    const submitted = await admin.from("experiences").update({ status: "pending_moderation" }).eq("id", draftId).eq("status", "awaiting_user_approval");
    if (submitted.error) throw submitted.error;

    try {
      EdgeRuntime.waitUntil(fetch(`${supabaseUrl}/functions/v1/process-story-notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "submit-story", experienceId: draftId }),
      }).catch((error) => console.error("story notification kick failed", error)));
    } catch (error) {
      console.error("story notification scheduling failed", error);
    }

    return json({ id: draftId, status: "pending_moderation", location, role: role || null, departureMonth, liveLabels: labels, emailQueued: true });
  } catch (error) {
    console.error("submit-story failed", error);
    return json({ error: error instanceof Error ? error.message : "Submission failed" }, 400);
  }
});
