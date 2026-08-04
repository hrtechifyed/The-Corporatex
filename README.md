# The Corporate Ex

A Next.js App Router application for anonymous, AI-assisted, contributor-approved and human-moderated workplace stories. Production hosting belongs on **Vercel**, not GitHub Pages, because authentication, secure Gemini calls, and moderation require server routes.

## Local setup

1. Install Node.js 20+, Docker, and the Supabase CLI.
2. Run `npm install` and copy `.env.example` to `.env.local`.
3. Start Supabase with `supabase start`, then apply versioned schema/RLS using `supabase db reset` (local) or `supabase db push` (linked project).
4. Copy the printed local URL and anon/service-role keys into `.env.local`. Keep `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` server-only.
5. Create a Google AI Studio Gemini API key and set `GEMINI_API_KEY`.
6. Run `npm run dev`. No experience content is written to browser storage; editors save through authenticated routes to Supabase.

## Authentication and the first moderator

In Supabase Authentication, enable email OTP/magic links and add `http://localhost:3000/auth/callback` plus the Vercel production/preview callback URLs. The database trigger creates exactly one random `HRT-XXXXXXXXX` profile per auth user. Emails remain in the protected `private_email` column.

Users cannot change roles through the application or RLS. Promote the first trusted moderator directly with the SQL editor/service administration channel:

```sql
update public.profiles set role = 'moderator' where private_email = 'trusted@example.com';
```

Never expose a role-promotion endpoint.

## Gemini and failed analysis

`POST /api/experiences/[id]/analyse` authenticates ownership, loads private source material, calls Gemini server-side, validates structured JSON with Zod, and saves the result as `awaiting_user_approval`. A failed call returns the record to `draft`; the original online draft remains intact and the contributor can retry. Monitor provider quotas and do not log prompt bodies.

## Original HRTechify logo

The prior prototype invented replacement HRTechify SVGs; they were removed. This checkout does not contain verified original artwork. Obtain the unchanged approved asset from the HRTechify brand owner and place it at `public/brand/hrtechify-logo-original.svg` (or an approved raster equivalent), then replace the explicit development warning in `components/site-footer.tsx` with `next/image`. Do not trace, recolour, crop, distort, or regenerate it. Use `src="/brand/hrtechify-logo-original.svg"`; Next/Vercel public assets resolve on local and nested application routes.

## Moderation operations

`/moderation` requires a database moderator role. Review original text, the contributor-approved final cut, and AI flags. Publishing assigns the permanent slug/date; reject/request-changes/unpublish actions are recorded privately. Approval by a contributor only produces `pending_moderation` and never publishes. To disable new submissions temporarily, block `/submit` with a Vercel feature flag/middleware condition or revoke the authenticated insert policy while leaving published reads available.

## Tests and quality gates

```bash
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Tests cover HRT format/collision retry, AI validation, status/publication authority, stable URLs, brand-asset regression, keyboard navigation, and database-rendered browse states. RLS behavior should additionally be verified against a local Supabase instance after every migration.

## Vercel deployment

Import the GitHub repository into Vercel, add all five `.env.example` values, set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin, and deploy. Add the production domain in Vercel, update DNS, then add its auth callback URL in Supabase. Preview deployments need allowed callback URLs too. Run migrations before enabling traffic. Do not configure GitHub Pages as the application host; it cannot run these server routes.

Before launch: install the verified logo, configure an operator contact in the policy pages, confirm magic-link delivery, create the first moderator, exercise RLS with anon/contributor/moderator sessions, set Gemini budget alerts, and verify social previews.

## Free-tier considerations

Supabase, Vercel, and Gemini free tiers have database, bandwidth, function, email, and request quotas. Autosave is debounced, browse results are capped, and Gemini is invoked only on explicit request. Configure spend/usage alerts and provider-backed email delivery before public launch. Fictional seed data belongs in `supabase/seed.sql`, is never hard-coded into UI, and must never be run automatically in production.
