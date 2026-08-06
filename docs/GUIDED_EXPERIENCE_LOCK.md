# CorporateX Guided Experience Lock

## Public route

The story-submission experience has one public destination:

- `guided-story.html`

Every visible **Share Your Story** link must point directly to that page.

`share-story.html` exists only as a compatibility redirect. It must not present another decision or start screen. `freeflow-story.html` remains retired.

## Journey stages

The page exposes one stage at a time:

1. **Context**
2. **Story chapters**
3. **Review**

The context form, chapter stage, editor, and review panel must not compete in the same viewport by default.

### Context

Required:

- company or organisation;
- broad location such as city and country, remote region, or hybrid location.

Optional:

- broad team or function.

The interface must not request a street address or the identity of another person.

### Story chapters

The journey contains exactly eight reusable chapters:

1. The Beginning
2. The Promise
3. The Good Part
4. The Shift
5. The Tipping Point
6. The Lesson
7. The AI Chapter
8. Who Thrives Here?

Only the active chapter and its immediate previous and next chapters are visible on desktop. Mobile shows only the active chapter. An eight-button chapter navigator allows direct revisiting without exposing all full cards at once.

Cards do not loop, orbit, cross, or float continuously. Motion is limited to a controlled transition when the active chapter changes. Reduced-motion users receive the same workflow without transforms.

### Editor

The editor displays the active prompt, helper, response field, character count, previous, next, skip, and review actions.

State remains in memory for the current page visit only. The interface must clearly state that refreshing or leaving clears the draft.

### Review

Review displays:

- company;
- optional team;
- location;
- all eight chapter states and responses;
- one final responsibility agreement;
- the exact safety-screen boundary.

## Safety-screen boundary

CorporateX does not moderate opinions or protect employers from criticism.

The planned safety screen is limited to:

- direct racial slurs;
- abusive slang or targeted attacks;
- threats or graphic violence;
- self-harm content;
- targeted abuse.

Contributors may still describe that discrimination, harassment, violence, abuse, or self-harm-related workplace impact occurred without reproducing slurs or graphic details.

The screen must not:

- rewrite meaning;
- decide whether criticism is fair;
- remove a story because it is negative;
- invent facts;
- treat one story as a company-wide verdict.

## Confirmation event

The prototype emits:

```text
guidedstoryconfirmed
```

The event contains validated context, chapter review data, and progress. It does not represent upload, publication, or server persistence.

## Brand contract

Visible product naming uses **CorporateX**.

The shared footer is:

```text
CorporateX - Powered by - HRTechify - People • Technology • Growth
© 2026 All Rights Reserved.
```

The HRTechify logo may remain as the powering brand asset, but the product name shown beside it is CorporateX.

## Change control

`tests/site-quality.mjs` must fail if a change:

- restores the old product name on a public page;
- restores an intermediate Share route;
- restores Free-flow;
- restores a functional Sign In control before accounts exist;
- shows all eight full chapter cards at once;
- adds continuous card animation;
- removes required company or location context;
- broadens safety screening into opinion moderation;
- changes the exact shared footer.

Run:

```bash
npm run check
```
