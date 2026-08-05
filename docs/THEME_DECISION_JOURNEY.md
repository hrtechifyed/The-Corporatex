# Interactive Theme Decision Journey

## Purpose

The previous optional-theme carousel exposed several choices at once. The replacement presents one narrative decision at a time so contributors can recognise the themes that belong in their experience without facing a dense questionnaire.

The journey is used on both Guided and Free-flow story routes. Free-flow treats it as optional; Guided uses it to identify the chapters that shaped the exit.

## Ten cards

1. The Opening Scene — expectations and promises before joining
2. The Role Rewrite — role clarity, scope and role change
3. The Leadership Turn — manager and leadership impact
4. The Culture Beneath — values, team behaviour, harassment and discrimination
5. The Weight of Work — workload, burnout and wellbeing
6. The Value Exchange — compensation and recognition
7. The Growth Horizon — career growth, learning and better opportunities
8. The Ground Shifted — layoffs, restructuring and job security
9. The Personal Crossroads — location, health, family and retirement
10. The AI Chapter — automation, productivity expectations and role redesign

The cards are generated from `src/theme-decision-data.js`; interaction is not duplicated card by card.

## In-memory state

Each card has one of five statuses:

- `unseen`
- `viewed`
- `selected`
- `ignored`
- `skipped`

The prototype keeps this state only in JavaScript memory for the current page session. The theme journey does not read or write `localStorage` or `sessionStorage`.

A future authenticated implementation should save the same status model against the contributor's current workflow record. The public story should contain only the themes the contributor confirms.

## Interaction rules

- Only one full card is active.
- Selecting or ignoring a card updates the summary and advances after a restrained transition.
- Leaving an unanswered card marks it skipped so it remains reviewable.
- Previous, Next and the ten-card index allow non-linear navigation.
- Completed decisions can be changed at any time.
- The final summary groups selected, ignored and skipped cards.
- `Confirm selected themes` dispatches a `themejourneyconfirmed` event for future form or database integration.
- Restart clears the in-memory state.

## Keyboard and assistive technology

- Enter or Space activates the front-side Reveal button.
- Left Arrow moves to the previous card.
- Right Arrow moves to the next card.
- Escape returns a flipped card to the front.
- Select and Ignore expose `aria-pressed`.
- Progress uses a native `progress` element.
- Selection confirmations use an `aria-live` region.
- Every control is a semantic button with a visible focus state.
- Reduced-motion mode removes the 3D transition while preserving front/back functionality.

## Responsive behaviour

### Mobile

- One full-width card
- Stacked decision actions
- Five-by-two compact card index
- No side previews or horizontal page scrolling
- Minimum 44px controls

### Tablet

- Active card remains dominant
- Selection tray moves beneath the card
- Touch-friendly controls and progress

### Desktop and large screens

- Active card is centred
- Previous and next previews appear beside it
- Selected themes remain visible in a compact side tray
- The layout is capped at a sensible maximum width

## Quality gates

`npm run test:themes` verifies:

- exactly ten reusable card records;
- required fields and sequential numbering;
- all five statuses;
- Select, Ignore, Skip, revise and restart state behaviour;
- completion and summary counts;
- no journey use of local or session storage;
- keyboard handlers and accessible states;
- skipped-card review and final confirmation;
- CSS perspective, vertical-axis flip and hidden backfaces;
- mobile, touch-target and reduced-motion rules.

The complete repository gate remains:

```bash
npm run check
```
