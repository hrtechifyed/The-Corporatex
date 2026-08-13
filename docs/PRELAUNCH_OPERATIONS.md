# CorporateX prelaunch operating runbook

This runbook turns the prelaunch audit into operational launch gates. It deliberately excludes contributor story text from telemetry and incident logs.

## Canonical production surface

- Canonical product origin: `https://hrtechifyed.github.io/The-Corporatex/`
- GitHub Pages is the only normal user-facing production frontend.
- Supabase provides authentication, database storage and trusted backend functions used by the GitHub Pages experience.
- Do not publish private or pending story content into public static assets.

## Production availability and load gate

Run `.github/workflows/prelaunch-smoke.yml` after every `main` deployment that changes launch-critical code. It waits for GitHub Pages, warms the public production pages, then measures Home, Stories, How It Works and Feedback with controlled concurrency.

Current prelaunch ceilings:

- zero failed requests
- request timeout: 15 seconds
- warm steady-state p95: at most 12 seconds
- concurrency: 5

If the smoke gate fails while GitHub Pages is still deploying, rerun after deployment finishes. If it fails after deployment is stable, do not approve broad launch until the failure is explained and fixed.

## Privacy-safe product telemetry

Do not add story text, email addresses, company names, locations or other contributor-entered fields to analytics or incident logs. Use aggregate counts and page-level operational signals only.

Key invite-beta journeys to watch:

1. Home and Stories browsing
2. Save / Follow actions
3. My Space access
4. Share Your Story entry
5. Story Beats completion
6. Final Cut review
7. safety review and submission
8. passwordless access-link delivery
9. moderated follow-up Q&A
10. Feedback submission

## Feedback operations

The Feedback page allows testers to rate one or more product sections and optionally leave a short note. Feedback is sent through the `submit-feedback` Supabase Edge Function and stored in the private `beta_feedback_submissions` table.

- Feedback does not require sign-in.
- Do not expose beta feedback as a public feed.
- Do not ask testers to include passwords, private access links, confidential employer material or sensitive personal data.
- Review reports using the `new`, `reviewing`, `resolved` and `archived` statuses.

## Email delivery monitoring

CorporateX uses Supabase authentication with the configured HRTechify email sender for passwordless account access. During invitation testing, participants should report missing or spam-folder mail without posting their email address or access link publicly.

If email delivery fails, inspect Supabase Auth logs and the configured SMTP provider. Never ask contributors to paste private magic links or SMTP credentials into support channels.

## Moderation operating procedure

A moderator must not publish until the public preview has been reviewed and explicitly confirmed. Review broad context, public headline/summary, anonymous contributor identity, approved Story Beats, themes and labels. Employer criticism, praise or an uncomfortable opinion is not a removal reason by itself.

Changes requested, rejection and unpublish require a private moderation reason. The story remains private unless and until a moderator confirms publication.

## Community report procedure

For each report:

1. open the public story;
2. compare the concern against Community Guidelines and the exact moderated public content;
3. mark `reviewing` while investigation is active;
4. use `resolved` when action/review is complete or `dismissed` when the report is not substantiated;
5. if public content needs removal, use the moderation/unpublish path so the action is auditable.

## Contributor withdrawal and deletion

- A contributor can manage their own submission from My Space.
- Do not manually expose a contributor email in support notes or public issue trackers.
- Account/data removal requests should be verified against the relevant account before action.

## Visual acceptance

The browser suite creates a retained visual matrix across desktop, laptop/tablet and mobile widths. Review the artifact whenever a launch-critical PR changes layout or artwork. A green DOM assertion alone is not proof of visual acceptance.

## Invitation rehearsal

Issue #54 remains the authoritative final human gate for broad launch. Do not close it until the required invited participants have completed the defined contributor, reader and return-user tasks and the forced failure scenarios. Do not post their private story text in GitHub.

Broad launch remains blocked until Site Quality, GitHub Pages deployment and production smoke are green, the rehearsal is complete, and no linked P0/P1 launch defect remains unresolved.
