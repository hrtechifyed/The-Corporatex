# Published Story Data Model

## Files

- `data/story.schema.json` — public story schema.
- `data/story-template.json` — copy for preparing an approved record.
- `data/published-stories.json` — public controlled-beta records.
- `data/beta-status.json` — readiness state and minimum content gates.

## Public fields

A published story contains only:

- stable story ID and slug;
- employer name;
- contributor-approved headline and summary;
- anonymous `HRT-` identifier;
- broad function, tenure and region;
- primary and optional contributing themes;
- publication date;
- approved public trust labels;
- narrative sections.

## Fields that must never enter the public data file

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
4. Include only the approved labels:
   - Anonymous contributor
   - Contributor approved
   - Human moderated
5. Add the record to the `stories` array in `data/published-stories.json`.
6. Run `npm run test:beta`.
7. Run the complete `npm run check` gate.
8. Review the rendered directory and story page.
9. Update `data/beta-status.json` only when the numerical and moderation gates are genuinely satisfied.

## Safe rendering

`src/beta-content.js` builds public story elements with DOM `textContent` rather than injecting contributor data through `innerHTML`. This reduces the risk of stored markup executing in the browser.

## Production transition

The static JSON layer is suitable for the controlled prototype. The authenticated application should later read approved public fields from the database while private account and moderation data remain protected by row-level security.
