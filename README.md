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
- a single Guided Story route;
- required company and broad location context;
- optional team context;
- eight reusable story chapters;
- fictional employer and story examples;
- employer-grouped discovery;
- Privacy & Safety and More pages;
- consistent CorporateX navigation and footer.

The current writing state is kept only in memory for the open page. Refreshing or leaving clears the draft. Nothing is uploaded or published by the static prototype.

## Safety review boundary

CorporateX does **not** moderate whether a contributor's opinion is positive, negative, fair, or favourable to an employer.

The planned safety screen is limited to:

- direct racial slurs;
- abusive slang or targeted personal attacks;
- threats or graphic descriptions of violence;
- self-harm content;
- targeted abuse.

Contributors may still say that discrimination, harassment, violence, abuse, or self-harm-related workplace impact occurred without reproducing slurs or graphic details.

The safety screen must not:

- protect an employer from criticism;
- rewrite the contributor's meaning;
- invent facts;
- decide whether one perspective represents an entire organisation.

## Trust principles

| Principle | Product behaviour |
| --- | --- |
| **One perspective** | A story describes one person, role, team, location, and period. |
| **Contributor meaning** | Structure may improve readability, but the account remains the contributor's. |
| **Private before public** | Draft, approval, and publication states remain separate. |
| **Safety screening only** | Harmful wording is screened; opinions are not moderated. |
| **Clear examples** | Fictional demonstrations are labelled and never presented as employee submissions. |
| **No automatic publishing** | AI or form completion cannot publish a story. |

## Guided Story flow

The current journey is intentionally staged:

1. **Context** — company, optional team, and broad location
2. **Story chapters** — one active chapter with previous and next previews
3. **Review** — the complete account, responsibility statement, and safety-screen explanation

Users can answer, skip, revisit, and edit every chapter. Keyboard navigation, touch targets, visible focus states, and reduced-motion behaviour are covered by automated tests.

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

### Production scaffold

```text
app/          Next.js routes
components/   application components
lib/          domain and server helpers
supabase/     database migrations and policies
tests/        workflow and static quality gates
```

The static prototype can run on GitHub Pages. Authentication, saved drafts, database-backed submissions, contributor approval, and publishing require the server application.

## Quick start

```bash
git clone https://github.com/hrtechifyed/The-Corporatex.git
cd The-Corporatex
npm install
npm run dev
```

Open `http://localhost:4173`.

Run the full quality gate:

```bash
npm run check
```

Build the static site:

```bash
npm run build
npm run preview
```

## Before accepting genuine stories

- add authenticated draft saving and recovery;
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
