<p align="center">
  <img src="./public/hrtechify-logo.svg" alt="HRTechify" width="240">
</p>

<h1 align="center">The Corporate Ex</h1>

<p align="center">
  <strong>Anonymous workplace exit stories, told responsibly.</strong><br>
  Former employees share what changed, why they left, and what future candidates should ask before joining.
</p>

<p align="center">
  <strong>Powered by HRTechify</strong> — People · Technology · Growth
</p>

<p align="center">
  <a href="#what-this-is"><strong>Product</strong></a> ·
  <a href="#how-it-works"><strong>How it works</strong></a> ·
  <a href="#privacy-and-safety"><strong>Privacy & safety</strong></a> ·
  <a href="#repository-shape"><strong>Architecture</strong></a> ·
  <a href="#quick-start"><strong>Quick start</strong></a> ·
  <a href="#deployment"><strong>Deployment</strong></a>
</p>

<p align="center">
  <img alt="Product status" src="https://img.shields.io/badge/status-public%20prototype-A21E1E.svg">
  <img alt="Powered by HRTechify" src="https://img.shields.io/badge/powered%20by-HRTechify-EF5B23.svg">
  <img alt="Contributor controlled" src="https://img.shields.io/badge/story-contributor%20controlled-FFC547.svg">
  <img alt="Human moderated" src="https://img.shields.io/badge/publication-human%20moderated-7A1717.svg">
</p>

---

## What this is

Most employer-review products reduce a complicated workplace experience to a rating, a short comment, or a list of pros and cons. That format is easy to scan, but it often removes the sequence that makes an exit understandable: what was promised, what changed, what the employee tried, and what finally made them leave.

**The Corporate Ex is built around the story rather than the score.**

A contributor can describe an experience in their own words or move through guided prompts. AI may organise the material for clarity, but it is not allowed to invent the story, intensify the language, or decide what becomes public. The contributor reviews the proposed final version, and a human moderator reviews it again before publication.

The governing rule is simple:

> **AI can help edit the account. It cannot own the account.**

The product is designed for former employees who want to explain an exit thoughtfully and for candidates who want better questions to ask before accepting an offer.

## Product principles

| Principle | What it means in practice |
| --- | --- |
| **Meaning stays with the contributor** | AI may structure or summarise only the material the contributor supplied. |
| **Nothing publishes automatically** | AI analysis produces a private draft, not a public story. |
| **The contributor approves every word** | The final cut can be edited, rewritten, or abandoned before moderation. |
| **Humans moderate publication** | A moderator checks privacy, safety, unsupported claims, and community rules. |
| **Identity is minimised** | Public stories use an anonymous `HRT-XXXXXXXXX` contributor identifier rather than a name or avatar. |
| **One story is one perspective** | Published accounts are contributor experiences, not independently verified statements about an entire company. |

## How it works

| Step | Experience |
| --- | --- |
| **1. Set the context** | Add the company, broad function, region, approximate tenure, work arrangement, and optional primary exit reason. |
| **2. Choose a format** | Use guided prompts, write a complete account freely, or combine both approaches. |
| **3. Organise with AI** | Gemini receives only the story material and broad context needed to prepare a clearer private draft. |
| **4. Approve the final cut** | The contributor reviews the headline, summary, themes, and story sections before submitting anything. |
| **5. Human moderation** | A moderator may publish, request changes, reject, edit for safety, or later withdraw a story. |
| **6. Responsible discovery** | Readers browse moderated stories by company and broad workplace context, then look for repeated patterns rather than treating one story as a verdict. |

## Product surfaces

| Page | Purpose |
| --- | --- |
| `index.html` | Branded public prototype with stories, the contribution journey, and the private-draft entry point. |
| `privacy-safety.html` | Plain-language explanation of data handling, prohibited information, AI boundaries, contributor control, moderation, and privacy requests. |
| `more-info.html` | Product overview, workflow, privacy summary, safety rules, moderation model, and contact details. |
| `app/` | Next.js App Router application scaffold for authenticated submissions, browsing, moderation, and server routes. |
| `supabase/` | Versioned database schema, row-level security policies, triggers, and seed support. |

## Privacy and safety

The Corporate Ex is intended for workplace experiences, not confidential records or personal allegations about identifiable individuals.

Contributors should not submit:

- names or direct identifiers of colleagues, managers, clients, or candidates;
- private email addresses, phone numbers, home addresses, or personal account details;
- confidential documents, customer data, source code, trade secrets, or internal credentials;
- medical, payroll, disciplinary, performance, immigration, or other sensitive employee-level records;
- threats, harassment, discriminatory abuse, doxxing, or content the contributor has no right to share;
- allegations presented as proven facts when they are personal interpretation or cannot be supported.

The production workflow is designed so that:

- authentication email remains private;
- story drafts remain private until contributor approval and moderator publication;
- Gemini is called server-side and does not receive the contributor's email;
- AI output is validated before it is stored;
- failed analysis returns the record to an editable draft state;
- role changes cannot be performed through a public application endpoint;
- publication and moderation actions are recorded separately from the public story.

Privacy, correction, withdrawal, and deletion requests can be sent to **hrtechifyed@gmail.com**.

## Repository shape

This repository currently contains two related surfaces.

### 1. Branded static prototype

The root `index.html`, `privacy-safety.html`, `more-info.html`, `src/`, and `public/` files form the directly testable HRTechify-branded prototype. The current `npm` scripts build and serve this surface.

```text
index.html
privacy-safety.html
more-info.html
src/
  main.js
  style.css
  hrtechify-theme.css
public/
  hrtechify-logo.svg
scripts/
  build.mjs
```

### 2. Production application scaffold

The production-oriented application code lives in the Next.js, Supabase, and server-side modules.

```text
app/                 Next.js routes and server actions
components/          Editors, moderation controls, navigation, and visual components
lib/                 Auth, schemas, Gemini integration, Supabase clients, and domain rules
supabase/            Migrations, RLS policies, triggers, and optional seed data
tests/               Unit and browser-oriented quality checks
```

The static prototype is suitable for direct visual review and GitHub Pages-style hosting. The authenticated production application requires a server runtime and should be deployed on Vercel or an equivalent Next.js platform.

## The production stack

| Layer | Technology |
| --- | --- |
| **Application** | Next.js App Router · React · TypeScript |
| **Styling** | Tailwind CSS plus the HRTechify visual system |
| **Authentication** | Supabase email OTP / magic links |
| **Database** | Supabase Postgres with row-level security |
| **AI editor** | Google Gemini, called only from server routes |
| **Validation** | Zod schemas around requests and generated analysis |
| **Moderation** | Database-backed contributor and moderator status transitions |
| **Hosting** | Static prototype on a static host; full application on Vercel |

## Quick start

The default scripts run the directly testable static prototype.

```bash
git clone https://github.com/hrtechifyed/The-Corporate-Ex.git
cd The-Corporate-Ex
npm install
npm run dev
```

Open `http://localhost:4173`.

Build and preview the static output:

```bash
npm run build
npm run preview
```

The build copies all public pages, shared assets, and client files into `dist/`.

## Production configuration

The authenticated application scaffold expects these values:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase anonymous key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only administration key. Never expose it to the browser. |
| `GEMINI_API_KEY` | Server-only key for the AI story editor. |
| `NEXT_PUBLIC_SITE_URL` | Canonical application origin used for callbacks and metadata. |

Copy `.env.example` to `.env.local` when preparing the production application.

## Authentication and the first moderator

Enable email OTP or magic-link authentication in Supabase and allow callback URLs for local, preview, and production environments.

A database trigger creates one anonymous `HRT-XXXXXXXXX` profile for each authenticated contributor. Emails remain in the protected `private_email` field and are not part of the public story model.

Promote the first trusted moderator through the Supabase SQL editor or another protected administration channel:

```sql
update public.profiles
set role = 'moderator'
where private_email = 'trusted@example.com';
```

There must never be a public role-promotion endpoint.

## AI and moderation boundaries

`POST /api/experiences/[id]/analyse` authenticates ownership, loads private source material, calls Gemini server-side, validates the structured response, and saves the result as `awaiting_user_approval`.

If analysis fails, the record returns to `draft` and the original submission remains available. Prompt bodies and private story material should not be written to application logs.

Contributor approval changes a story to `pending_moderation`; it does **not** publish it. Only a moderator can move a record to `published`. Rejection, requested changes, editing, publication, unpublishing, and private moderation reasons are recorded as moderation actions.

## Quality gates

The production application is intended to pass:

```bash
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Important coverage areas include anonymous-ID generation, AI output validation, status-transition authority, stable public URLs, brand assets, keyboard navigation, responsive layouts, and database-rendered browse states.

RLS behavior should also be tested against a local Supabase instance after every migration.

## Deployment

### Static prototype

Run `npm run build` and publish `dist/` to a static host. Asset paths are relative so the pages can work under a project subdirectory.

### Authenticated application

Deploy the Next.js application to Vercel, configure the five environment values, add the production and preview callback URLs in Supabase, and apply database migrations before enabling submissions.

A static host cannot run authentication callbacks, secure Gemini requests, moderation routes, or server-side Supabase operations.

## Operational checklist

Before accepting real submissions:

- confirm the approved HRTechify logo and product naming;
- configure production contact and privacy-request handling;
- verify magic-link delivery and callback URLs;
- create and test the first moderator account;
- test anonymous, contributor, and moderator RLS behavior;
- confirm AI quota and spending alerts;
- test withdrawal, deletion, reporting, and unpublishing workflows;
- verify social previews, canonical URLs, accessibility, and mobile layouts;
- remove fictional demonstration stories or label them unmistakably as examples.

## Contact

Questions, partnerships, privacy requests, or suggestions:

**hrtechifyed@gmail.com**

---

<p align="center">
  <strong>HRTechify</strong><br>
  People · Technology · Growth
</p>

<p align="center">
  © 2026 HRTechify. All Rights Reserved.
</p>
