# CorporateX prelaunch operating runbook

This runbook turns the prelaunch audit into operational launch gates. It deliberately excludes contributor story text from telemetry and incident logs.

## Canonical production surface

- Canonical product origin: `https://corporatex.onrender.com`
- GitHub Pages: public static mirror only. It declares the canonical Render origin and hands live stories, sign-in and contribution actions to the live application.
- Do not publish private or pending story content to the static mirror.

## Production health and load gate

Run `.github/workflows/prelaunch-smoke.yml` after every `main` deployment that changes launch-critical code. It warms the service, then measures `/api/health`, `/`, `/browse` and `/more` with controlled concurrency.

Current prelaunch ceilings:

- zero failed requests
- request timeout: 15 seconds
- warm steady-state p95: at most 12 seconds
- concurrency: 5

If the smoke gate fails because Render is still deploying, rerun after the deployment finishes. If it fails after deployment is stable, do not approve broad launch until the failure is explained and fixed. If repeated warm p95 is near the ceiling under this light load, upgrade hosting before adding public traffic.

## Privacy-safe funnel telemetry

`/api/telemetry` accepts only an event name, a path and a timestamp. Query strings are removed before server logging. Never add story text, email addresses, company names, locations or other contributor-entered fields to funnel events.

Launch funnel events/pages to monitor:

1. home page view and `home_share_story`
2. `ending_chosen`
3. `/submit/scene`
4. `story_beats_started`
5. `final_cut_reached`
6. `safety_check_started`
7. `safety_passed` or `safety_blocked`
8. `verification_gate_reached`
9. `verification_email_requested`
10. `/submit/finish`
11. `submission_completed`
12. `/account` return visits

Use aggregate counts only. Do not correlate telemetry with private story content.

## Email delivery monitoring

CorporateX logs Gmail API acknowledgement for sign-in, submission verification and moderation-outcome mail using `corporatex_email_delivery` structured logs. Monitor for `status: failed` and for a sustained gap between verification-email requests and successful submission completions.

A Gmail API send acknowledgement is not a guarantee of inbox delivery. During invitation alpha, participants should report missing/spam-folder mail as outcome-level findings in issue #54 without posting their email address publicly.

If email delivery fails:

1. verify `GMAIL_USER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_REFRESH_TOKEN` on Render;
2. verify Gmail API OAuth token validity;
3. check server logs for the structured delivery error;
4. do not ask contributors to paste private magic links into support channels;
5. after credentials are repaired, use the resend control on the verification page.

## Abuse controls

Current single-instance controls rate-limit:

- passwordless sign-in email requests: 5 per 15 minutes per IP + email hash
- submission verification email requests: 5 per 15 minutes per IP + email hash
- public story reports: 8 per hour per IP + story

Identifiers are SHA-256 hashed before in-memory bucket storage. These limits are suitable only while the application runs as a single Render process. Before horizontal scaling, replace them with a shared rate-limit store.

## Moderation operating procedure

A moderator must not publish until the “What will be published” preview has been reviewed and explicitly confirmed. The preview must include:

- Ending
- public headline and summary
- company display name
- broad role/function
- broad region
- approximate tenure
- work arrangement
- anonymous HRT contributor identity
- every public Story Beat/highlight
- every public label

Employer criticism, praise or an uncomfortable opinion is not a removal reason by itself.

Changes requested, rejection and unpublish require a private moderation reason. CorporateX sends the contributor an outcome email; the story remains private unless and until a moderator confirms publication.

## Community report procedure

The moderator workspace exposes `open` and `reviewing` reports. For each report:

1. open the public story;
2. compare the concern against Community Guidelines and the exact moderated public content;
3. mark `reviewing` while investigation is active;
4. use `resolved` when action/review is complete or `dismissed` when the report is not substantiated;
5. if public content needs to be removed, use the story moderation unpublish path so the action is audited.

## Contributor withdrawal and deletion

- A contributor can withdraw a pending or published story from My Stories.
- A withdrawn or otherwise private record can be permanently deleted by the owning account.
- Do not manually expose a contributor email in support notes or public issue trackers.

## Visual acceptance

The browser suite creates a retained visual matrix for:

- 1920×1080
- 1440×900
- 768×1024
- 390×844

Pages: Home, How It Works, About, Submit, Setting the Scene and Browse.

Review the retained artifact when a visual launch-critical PR changes layout or artwork. A green DOM assertion alone is not proof of visual acceptance.

## Invitation rehearsal

Issue #54 is the authoritative final human gate. Do not close it until 10–20 real invited participants have completed the defined contributor, reader and return-user tasks and the forced failure scenarios. Do not post their private story text in GitHub.

Broad launch remains blocked until:

- PR #53 (or its documented successor) is merged;
- Site quality is green on final `main`;
- GitHub Pages deployment is green;
- production smoke is green;
- issue #54 is closed with `PRELAUNCH_REHEARSAL_COMPLETE`;
- no linked P0/P1 launch defect remains unresolved.
