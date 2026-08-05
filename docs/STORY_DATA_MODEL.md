# Published Story Data Model

## Files

- `data/story.schema.json` — public story schema.
- `data/story-template.json` — approved-record template.
- `data/published-stories.json` — public controlled-beta records.
- `data/beta-status.json` — readiness state and minimum gates.

## Public fields

A published story contains only a stable story ID and slug, employer name, contributor-approved headline and summary, anonymous ID, broad function, tenure and region, themes, publication date, approved trust labels and the narrative sections.

## Never-public fields

- contributor email or real name;
- phone number or personal social account;
- exact team, manager name or unique project identifier;
- private moderation notes;
- uploaded proof or verification records;
- customer, payroll, medical or disciplinary information;
- internal documents, credentials or confidential material.

## Ingestion procedure

1. Copy `data/story-template.json`.
2. Replace every placeholder with contributor-approved wording.
3. Validate the anonymous ID and slug formats.
4. Use only Anonymous contributor, Contributor approved and Human moderated labels.
5. Add the record to `data/published-stories.json`.
6. Run `npm run test:beta` and `npm run check`.
7. Review the rendered directory and story page.
8. Update `data/beta-status.json` only when all gates are genuinely satisfied.

## Safe rendering

`src/beta-content.js` creates story nodes with DOM `textContent` rather than injecting contributor data through `innerHTML`.

## Production transition

The static JSON layer supports the controlled prototype. The authenticated application should later read approved public fields from the database while private account and moderation data remain protected by row-level security.
