<p align="center">
  <img src="./public/hrtechify-logo.svg" alt="HRTechify" width="220">
</p>

<h1 align="center">CorporateX</h1>

<p align="center">
  <strong>Before you join, hear why people left.</strong><br>
  Structured exit stories for better employer decisions.
</p>

<p align="center">
  <strong>Powered by HRTechify</strong> — People · Technology · Growth
</p>

---

## Product idea

Ratings show sentiment. CorporateX preserves the sequence behind an exit:

1. What attracted the contributor
2. What they expected
3. What genuinely worked
4. What changed
5. Why leaving became necessary
6. What a future candidate should ask
7. How technology or AI affected the role
8. Who might still thrive in the right conditions

The product is designed to help candidates ask better questions—not to produce a score or a company-wide verdict.

## Current public prototype

The GitHub Pages prototype contains:

- a cinematic Home page;
- one Guided Story route;
- a visual Set the Scene stage;
- required company and broad location context;
- optional team context;
- eight reusable Story Beats;
- a reversible Final Cut review;
- fictional employer and story examples;
- employer-grouped discovery;
- visual More and expandable Privacy & Safety pages;
- consistent CorporateX navigation and footer.

The current writing state is held only in memory for the open page. Refreshing or leaving clears the draft. Nothing is uploaded or published by the static prototype.

## Guided Story flow

The journey is intentionally staged:

1. **Set the Scene** — illustrated context entry with Company, Location, and optional Team
2. **Story Beats** — one active beat with adjacent previews and direct numbered navigation
3. **The Final Cut** — context, all responses, safety-screen explanation, and confirmation

The Story Beats are:

- The Beginning
- The Promise
- The Good Part
- The Shift
- The Tipping Point
- The Lesson
- The AI Turn
- Who Thrives Here?

Contributors can move back from Story Beats to context, from The Final Cut to Story Beats, or from The Final Cut to context without losing in-memory responses.

## Safety review boundary

CorporateX does **not** moderate whether a contributor's opinion is positive, negative, fair, or favourable to an employer.

The planned safety screen is limited to:

- direct racial slurs;
- abusive slang or targeted personal attacks;
- threats or graphic descriptions of violence;
- self-harm content;
- targeted abuse.

Contributors may still say that discrimination, harassment, violence, abuse, or self-harm-related workplace impact occurred without reproducing slurs or graphic details.

The safety screen must not protect an employer from criticism, rewrite meaning, invent facts, or treat one story as a company-wide verdict.

## Trust principles

| Principle | Product behaviour |
| --- | --- |
| **One perspective** | A story describes one person, role, team, location, and period. |
| **Contributor meaning** | Structure may improve readability, but the account remains the contributor's. |
| **Private before public** | Draft, approval, and publication states remain separate. |
| **Safety screening only** | Harmful wording is screened; opinions are not moderated. |
| **Clear examples** | Fictional demonstrations are labelled and never presented as employee submissions. |
| **No automatic publishing** | AI or form completion cannot publish a story. |

## Repository shape

### Static prototype

```text
index.html
guided-story.html
stories.html
story-detail.html
more-info.html
privacy-safety.html
src/
public/
scripts/build.mjs
```

### Production application

```text
app/          Next.js pages and API routes
components/   application components
lib/          domain and server helpers
supabase/     database migrations and policies
tests/        workflow, static and server readiness gates
render.yaml   Render Web Service blueprint
```

GitHub Pages publishes the static prototype from `dist`. The Next.js application provides the server path required for authentication, saved drafts, database-backed submissions, Gmail alerts, contributor approval and publishing.

## Run the Next.js application

```bash
git clone https://github.com/hrtechifyed/The-Corporatex.git
cd The-Corporatex
npm install
cp .env.example .env.local
npm run dev
```

Add the required private values to `.env.local`, then open:

```text
http://localhost:3000
```

Create the production server build with:

```bash
npm run build
npm run start
```

The health endpoint is:

```text
/api/health
```

## Run the static GitHub Pages prototype

```bash
npm install
npm run dev:static
```

Open:

```text
http://localhost:4173
```

Build and preview the static site with:

```bash
npm run build:static
npm run preview:static
```

## Validation

Run both the static quality gate and the complete Next.js production build:

```bash
npm run check
```

Run only the static GitHub Pages checks:

```bash
npm run check:static
```

Run only the server build:

```bash
npm run check:server
```

## Render deployment

The repository includes `render.yaml`. Create a new Render Blueprint from this repository and enter the environment values marked for manual configuration. Render will use:

```text
Build command: npm install --no-audit --no-fund && npm run build
Start command: npm run start
Health check: /api/health
```

Do not commit `.env.local`, Google OAuth credentials, Supabase secrets, or API keys.

## Before accepting genuine stories

- verify authenticated draft saving and recovery;
- show a reliable saved-state indicator;
- separate private draft, confirmed, safety-reviewed, and published states;
- require contributor approval of the exact public wording;
- support withdrawal and deletion requests;
- establish privacy and safety operations;
- replace or clearly separate fictional examples;
- test the complete workflow with genuine contributors;
- obtain qualified legal review of public terms and policies.

## Contact

Questions, partnerships, privacy requests, or product feedback:

**hrtechifyed@gmail.com**

---

<p align="center">
  <strong>CorporateX - Powered by - HRTechify - People • Technology • Growth</strong><br>
  © 2026 All Rights Reserved.
</p>
