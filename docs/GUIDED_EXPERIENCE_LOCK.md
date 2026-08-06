# Guided Experience Lock

## Source of truth

The public story-submission experience contains one route:

1. `share-story.html`
2. `guided-story.html`

`freeflow-story.html` is retired and must not be included in the production build.

The Guided experience uses:

- `src/reference-exact.css`
- `src/reference-functional.css`
- `src/cinematic-card-system.css`
- `src/guided-only-aerial.css`
- `src/reference-exact.js`
- `src/story-workflow-model.js`

## Share Your Story

- One Guided Story entry only
- One image-led cinematic card
- One primary action: `Start Guided Story`
- One brief explanation of the eight-chapter journey
- One open-beta note
- No route comparison or switch language

## Guided Story

### Context

Before review, the contributor must provide:

- company or organisation;
- optional broad team;
- location expressed as city and country, broad region, remote region, or hybrid location.

The interface must not request a street address or the identity of another person.

### Chapters

The journey contains exactly eight semantic chapter buttons:

1. The Beginning
2. The Promise
3. The Good Part
4. The Shift
5. The Tipping Point
6. The Lesson
7. The AI Chapter
8. Who Thrives Here?

Each card face uses an illustration, number, short title, one question and a text status.

### Aerial formation

On wide desktop screens with hover and a precise pointer:

- the eight cards occupy fixed points along one shallow edge-to-edge curve;
- cards never cross, reorder or travel through another card;
- each card uses a slow nine-pixel vertical float with a very small horizontal drift;
- hovering or focusing the deck pauses all card motion;
- the active card moves visually forward;
- the deck clips and contains its own paint so it cannot overlap the context form or create page-level overflow.

Laptop and tablet widths use a stable four-column grid. Mobile uses the existing focused horizontal journey. Touch-only and reduced-motion experiences remain stationary and fully functional.

### Layout containment

The context form, progress toolbar, card stage, editor and review panel must remain separate document-flow sections.

The card stage must:

- have positive vertical spacing after the progress toolbar;
- use fixed card coordinates inside its own containing block;
- keep the first and eighth cards fully inside the viewport;
- use `overflow: hidden` and `contain: layout paint` on wide desktop;
- avoid `offset-path` motion and negative vertical centring transforms.

## Review and confirmation

Review displays validated company, optional team, location, all eight chapters and one final agreement checkbox.

The confirmation event is:

```text
guidedstoryconfirmed
```

The event contains context, chapter review data and progress. It does not represent publication or server persistence.

## Change control

Changes that restore a second submission route, remove required company/location context, allow the card stage to overlap another section, or apply moving card animation to touch or reduced-motion users should fail `tests/site-quality.mjs`.

Run:

```bash
npm run check
```
