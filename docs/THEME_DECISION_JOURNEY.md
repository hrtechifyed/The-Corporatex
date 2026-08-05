# Interactive Theme Decision Journey

## Purpose

The previous Free-flow **Choose a chapter—or skip it** section exposed several choices at once. The replacement presents one narrative decision at a time so contributors can recognise the themes that belong in their experience without facing a dense questionnaire.

The enhancement is intentionally limited to `freeflow-story.html`. Guided Story retains its separate turning-point and story-arc experience.

## Ten reusable cards

1. **The Opening Scene** — expectations and promises before joining
2. **The Role Rewrite** — role clarity, scope and role change
3. **The Leadership Turn** — manager and leadership impact
4. **The Culture Beneath** — values, team behaviour, harassment and discrimination
5. **The Weight of Work** — workload, burnout and wellbeing
6. **The Value Exchange** — compensation and recognition
7. **The Growth Horizon** — career growth, learning and better opportunities
8. **The Ground Shifted** — layoffs, restructuring and job security
9. **The Personal Crossroads** — location, health, family and retirement
10. **The AI Chapter** — automation, productivity expectations and role redesign

All cards are generated from `src/theme-decision-data.js`. The interface uses one reusable renderer rather than ten separately coded interactions.

## In-memory state

Each card has one of five statuses:

- `unseen`
- `viewed`
- `selected`
- `ignored`
- `skipped`

The prototype keeps theme choices only in JavaScript memory for the current page session. The journey does not read or write `localStorage` or `sessionStorage`, and its decisions are not included in the existing browser draft storage.

A future authenticated implementation should persist the same status model against the contributor's current workflow record. Only contributor-confirmed selected themes should become part of a submitted story.

## Interaction rules

- Only one full card is active.
- The front contains the number, theme, teaser, illustration and reveal instruction.
- The back contains context, a supporting question, Select, Ignore and Skip actions.
- The upcoming card name remains visible outside the flip surface, including on mobile.
- Selecting or ignoring updates the summary and advances after a restrained transition.
- Leaving an unanswered card marks it skipped so it remains reviewable.
- Previous, Next and the ten-card index support non-linear navigation.
- Completed decisions can be revised in either direction.
- The final summary groups selected, ignored and skipped cards.
- `Confirm selected themes` dispatches `themejourneyconfirmed` for future workflow or database integration.
- Every state change dispatches `themejourneychange`.
- Restart clears the in-memory state.

## Keyboard and assistive technology

- Enter or Space activates the semantic Reveal button.
- Left Arrow moves to the previous card.
- Right Arrow moves to the next card.
- Escape returns a flipped card to the front.
- Tab moves through visible actions only.
- The hidden front face is removed from the tab order after flipping.
- The hidden back face is `inert` before revealing.
- Select and Ignore expose `aria-pressed`.
- Progress uses a native `progress` element.
- Selection confirmations use an `aria-live` region.
- Every control has a visible focus state.
- Reduced-motion mode removes the 3D transition while preserving the full interaction.

## Responsive behaviour

### Mobile

- One full-width active card
- Stacked Select, Ignore and Skip actions
- Five-by-two compact card index
- Compact always-visible next-card label
- No side previews or horizontal page scrolling
- Minimum 44px controls

### Tablet

- Active card remains dominant
- Selection tray moves beneath the card
- Touch-friendly controls and progress

### Desktop and large screens

- Active card remains centred within a capped width
- Previous and next previews appear beside it
- Selected themes remain visible in a compact side tray
- Extra width is used for context rather than stretching the card

## Quality gates

`npm run test:themes` verifies:

- exactly ten reusable card records;
- required fields and sequential numbering;
- all five statuses;
- Select, Ignore, Skip, revision and restart behaviour;
- completion and summary counts;
- Free-flow-only integration;
- no theme-journey use of local or session storage;
- keyboard handlers, hidden-face focus control and accessible state;
- skipped-card review and final confirmation;
- CSS perspective, vertical-axis flip and hidden backfaces;
- mobile, touch-target and reduced-motion rules.

The complete repository gate remains:

```bash
npm run check
```
