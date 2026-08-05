# Story Page Behaviour

## Guided Story

### Card behaviour

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

- makes it the only active chapter;
- updates `aria-pressed`;
- centres the card in a horizontal deck when required;
- reveals its prompt, helper and saved in-memory response;
- moves focus to the editor when selected by click or tap.

### Card states

- **Open chapter** — unanswered.
- **Answered** — contains non-empty text.
- **Skipped** — deliberately skipped and available for later editing.

State is communicated by label, border and icon—not colour alone.

### Navigation

- Card click or tap activates a chapter.
- Left and Right Arrow keys move between chapter cards.
- Previous and Next move through the sequence.
- Skip & Next marks the active chapter as skipped.
- Review Story becomes available after at least one answered chapter.
- Edit returns from review to the chosen chapter.

### Animation

- Hover and focus lift the card slightly.
- The active card receives controlled depth, glow and image emphasis.
- Editor and review panels fade upward once when opened.
- There is no rapid bounce, spin or constant deck movement.
- `prefers-reduced-motion` removes transforms and animation while retaining every interaction.

## Free-flow Story

### Form order

1. Employer or organisation
2. Broad job function
3. Approximate tenure
4. Region or country
5. Optional story title
6. Optional primary theme
7. Main story field

Employer and story text are required for review. The main account must contain at least 80 characters so a reader receives useful context.

### Review and confirmation

Review mode displays the exact current values and full story. The contributor can return to editing at any time.

One final checkbox confirms that the account is:

- genuine and first-person;
- not invented or deliberately exaggerated;
- free from names, identifying details and confidential information;
- a personal perspective rather than a universal claim;
- written with awareness that readers may use it for career decisions.

### Prototype state

Choices and writing remain in memory only for the current page visit. The interface does not use `localStorage` or `sessionStorage`.

The confirmation actions emit integration events for a future authenticated moderation workflow:

```text
guidedstoryconfirmed
freeflowstoryconfirmed
```

The current prototype does not publish, email or upload a story.

## Accessibility contract

- All cards and actions are semantic buttons.
- Interactive targets are at least 44px high.
- Focus indicators remain visible.
- Status changes use live regions.
- Invalid fields receive `aria-invalid` and linked error text.
- The mobile navigation exposes `aria-controls` and closes with Escape.
- Reduced-motion users receive the same workflow without animation.
