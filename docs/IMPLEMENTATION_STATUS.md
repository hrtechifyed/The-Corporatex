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

The authoritative state is `data/beta-status.json`.

## Merge order

The pull requests are stacked and must be reviewed and merged in phase order.

## Final release decision

The controlled beta opens only after genuine stories satisfy the content gates, every contributor approves the public wording, every story passes human moderation, demonstration content is removed from the default directory, the status changes to `ready_for_controlled_beta`, and `npm run check` passes after the final import.
