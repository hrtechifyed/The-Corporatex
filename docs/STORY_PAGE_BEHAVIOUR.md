# Story Page Behaviour

## Single Guided Story route

The website now offers one story-submission route: **Guided Story**. The retired Free-flow page and all visible route-switching controls are removed.

## Required story context

Before a story can enter review, the contributor must provide:

- **Company or organisation** — required.
- **Team** — optional and deliberately broad.
- **Location** — required; this may be a city and country, a broad region, or a remote-work region.

The location field includes suggestions such as `Bengaluru, India`, `Remote — Europe`, and `Hybrid — city and country`. The interface does not request a street address or another person's identity.

Context is held in memory for the current page visit and included in the future `guidedstoryconfirmed` integration event.

## Chapter cards

Each of the eight cards represents one reusable chapter from `src/story-workflow-model.js`.

1. **The Beginning** — why the contributor joined.
2. **The Promise** — what they expected or were told.
3. **The Good Part** — what genuinely worked.
4. **The Shift** — when the experience changed.
5. **The Tipping Point** — why leaving became necessary.
6. **The Lesson** — what a future candidate should ask.
7. **The AI Chapter** — how AI or automation affected the work.
8. **Who Thrives Here?** — the honest right-fit caveat.

Selecting a card:

- makes it the active chapter;
- updates `aria-pressed`;
- reveals its full prompt, helper and current response in the editor;
- keeps the card available for later revision;
- moves focus to the editor after click or tap.

## Aerial formation and motion

On wide desktop screens with a precise pointer, the cards travel slowly along one shallow edge-to-edge curve.

- The complete journey lasts 96 seconds before reversing.
- Eight staggered delays keep the cards distributed across the curve.
- Hovering or focusing anywhere in the deck pauses every card.
- The active card moves forward visually without changing its semantic order.
- Tablet layouts use a stable grid.
- Mobile layouts use a horizontal snap journey.
- Touch-only and reduced-motion environments do not use the aerial animation.

## Card states

- **Open chapter** — unanswered.
- **Answered** — contains non-empty text.
- **Skipped** — deliberately skipped and available for later editing.

State is communicated by text, border and icon—not colour alone.

## Navigation

- Card click or tap activates a chapter.
- Left and Right Arrow keys move between chapter cards.
- Previous and Next move through the sequence.
- Skip & Next marks the active chapter as skipped.
- Review becomes available after at least one answered chapter.
- Review is blocked until company and location are valid.
- Edit returns from review to the context and chapter editor.

## Review and confirmation

Review mode displays:

- company;
- optional team;
- location;
- all eight chapter responses and their current states;
- one responsibility checklist;
- one final agreement checkbox.

The confirmation action emits:

```text
guidedstoryconfirmed
```

Its event detail contains validated context, all chapters and progress. The prototype does not publish, email or upload the story.

## Prototype state

Context and writing remain in memory only for the current page visit. The interface does not use `localStorage` or `sessionStorage`.

## Accessibility contract

- All cards and actions are semantic buttons.
- Interactive targets are at least 44px high.
- Focus indicators remain visible.
- Status changes use live regions.
- Invalid required context fields receive `aria-invalid` and linked error text.
- The mobile navigation exposes `aria-controls` and closes with Escape.
- Reduced-motion users receive the same workflow without animation.
