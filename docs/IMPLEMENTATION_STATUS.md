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

## Post-programme enhancement

The Free-flow **Choose a chapter—or skip it** section now has a dedicated interactive theme-decision journey:

- ten reusable, data-driven narrative cards;
- polished front/back 3D reveal;
- Select, Ignore and Skip decisions;
- previous, next and direct-card navigation;
- progress and selected/ignored/skipped counts;
- revisable choices and skipped-card review;
- final grouped summary and confirmation event;
- mouse, touch, keyboard and screen-reader support;
- reduced-motion behaviour;
- theme choices held only in memory for the current page session.

The implementation is documented in `docs/THEME_DECISION_JOURNEY.md` and tested by `npm run test:themes`.

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

The six programme pull requests must be reviewed and merged in phase order. The interactive theme-decision journey is stacked after the Phase 6 engineering branch.

## Final release decision

The controlled beta opens only after genuine stories satisfy the content gates, every contributor approves the public wording, every story passes human moderation, demonstration content is removed from the default directory, the status changes to `ready_for_controlled_beta`, and `npm run check` passes after the final import.
