# 9/10 Programme Implementation Status

## Completed engineering phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Minimal interface copy and visible-copy budgets | Implemented |
| 2 | Progressive disclosure and writing-first Free-flow | Implemented |
| 3 | Trust labels, fictional demonstrations and moderation rubric | Implemented |
| 4 | Typography, imagery and restrained motion | Implemented |
| 5 | Accessibility, performance budgets and CI quality gates | Implemented |
| 6 | Controlled-beta data model, safe rendering and intake operations | Engineering implemented |

## External content gate

Phase 6 cannot be declared **content-ready** until genuine contributors provide stories and approve their publication.

Current state:

- published genuine stories: 0;
- minimum controlled-beta stories: 10;
- target stories: 15;
- minimum employers: 5;
- minimum primary themes: 6;
- employee verification: deliberately deferred.

The authoritative machine-readable state is `data/beta-status.json`.

## Merge order

The pull requests are stacked and must be reviewed and merged in phase order. Later phases assume the preceding branch content.

## Final release decision

The engineering programme is complete when all six PRs pass their quality gates. The controlled beta is ready to open only after:

1. genuine stories satisfy the numerical content gates;
2. every contributor approves the exact public wording;
3. every story passes human moderation;
4. demonstration content is removed from the default directory;
5. `data/beta-status.json` is changed to `ready_for_controlled_beta`;
6. `npm run check` passes after the final content import.
