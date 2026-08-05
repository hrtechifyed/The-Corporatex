# Guided Experience Lock

## Source of truth

The public story-submission experience now contains one route:

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

### Aerial motion

On wide desktop screens with hover and a precise pointer:

- cards move slowly along one shallow edge-to-edge curve;
- the journey takes 96 seconds before reversing;
- staggered delays distribute all eight cards across the curve;
- hovering or focusing the deck pauses all cards;
- the active card moves visually forward.

Tablet, touch, mobile and reduced-motion experiences must remain stationary and fully functional.

## Review and confirmation

Review displays validated company, optional team, location, all eight chapters and one final agreement checkbox.

The confirmation event is:

```text
guidedstoryconfirmed
```

The event contains context, chapter review data and progress. It does not represent publication or server persistence.

## Change control

Changes that restore a second submission route, remove required company/location context, or apply moving card animation to touch or reduced-motion users should fail `tests/site-quality.mjs`.

Run:

```bash
npm run check
```
