# Progressive Disclosure Rules

## Purpose

Optional information should appear only when it helps the user make the next decision.

## Story routes

### Guided Story

- Show the compact page heading and format switch.
- Show story doors with a short title and one emotional cue.
- Reveal detailed reasons only after a story door is selected.
- Keep chapter helper text inside the active editor rather than every chapter card.

### Free-flow Story

Default order:

1. broad employer context;
2. the main writing field;
3. optional theme selection;
4. responsibility checkpoint;
5. save and review actions.

The theme carousel stays collapsed until the contributor opens **Add an optional theme**.

## Informational pages

More and Privacy & Safety show one sentence per topic by default. Additional context is placed inside native `details` elements so it remains keyboard-accessible and available without cluttering the page.

## Acceptance criteria

- A contributor reaches a writing field within two interactions.
- Free-flow is visibly lighter than Guided.
- Optional themes are collapsed by default in Free-flow.
- Policy detail is available within one click.
- The experience still works when the disclosure module fails to load.
- Native disclosure controls remain keyboard-operable and respect reduced-motion preferences.
