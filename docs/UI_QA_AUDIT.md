# CorporateX UI and Product QA Audit

## Scope

Audited the public experience across Home, Guided Story, Employer Stories, Story Detail, More, and Privacy & Safety.

## Decisions implemented

### 1. Product and entry

The public product name is **CorporateX**. Every visible **Share Your Story** action opens `guided-story.html` directly. The compatibility Share page redirects immediately and Free-flow remains retired.

### 2. Cinematic but calm Guided journey

The page exposes one stage at a time:

1. Set the Scene
2. Story Beats
3. The Final Cut

The context form, beat selector, editor, and Final Cut never compete in the same viewport by default.

### 3. Set the Scene redesign

The context stage now uses an illustration and a split cinematic layout. Company and Location share the first desktop row; optional Team uses the full second row. Inputs have equal heights, aligned labels, and reserved error space.

Required:

- company or organisation;
- broad location.

Optional:

- broad team.

### 4. Story Beat language and presentation

User-facing “chapter” language has been replaced by **Story Beat**. The eight beats are:

1. The Beginning
2. The Promise
3. The Good Part
4. The Shift
5. The Tipping Point
6. The Lesson
7. The AI Turn
8. Who Thrives Here?

Only the active beat and immediate previews appear on desktop. Mobile shows one active beat. Motion occurs only after deliberate user action.

### 5. Reversible navigation

Contributors can:

- return from Story Beats to context;
- return from The Final Cut to Story Beats;
- return from The Final Cut to context;
- revisit any beat through the numbered navigator;
- edit an individual beat from The Final Cut.

No entered context or response is discarded while moving between these stages.

### 6. More page visual optimisation

The previous text-first accordion stack was replaced by:

- an illustrated hero;
- three image-led distinction cards;
- one AI-era visual feature;
- three compact trust cards.

The page now communicates with visuals and short statements rather than large default text blocks.

### 7. Safety screening only

CorporateX does not moderate opinions or protect employers from criticism. The safety screen is limited to direct racial slurs, abusive slang or targeted attacks, threats or graphic violence, self-harm content, and targeted abuse.

### 8. Shared shell and prototype state

Every public page uses the same navigation and exact footer. Writing remains in memory for the current page visit. Confirmation emits `guidedstoryconfirmed` but does not upload or publish the story.

## Acceptance criteria

- CorporateX is the only visible product name.
- Guided public copy uses Story Beat rather than chapter.
- Context includes a supporting illustration and aligned fields.
- The AI card is titled The AI Turn.
- Context, Story Beats, and The Final Cut are separate stages.
- Reverse navigation is available from Story Beats and The Final Cut.
- No Guided card uses continuous animation.
- More is image-led and has no text-first accordion stack.
- Company and location are required; team remains optional.
- Safety screening is not presented as opinion moderation.
- No story workflow uses `localStorage` or `sessionStorage`.
- `npm run check` passes before deployment.
