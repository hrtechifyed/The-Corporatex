# Story Page Behaviour

## Single Guided Story route

The website offers one story-submission route: **Guided Story**. Free-flow and route switching remain retired.

## Set the Scene

The first stage asks for:

- **Company or organisation** — required
- **Location** — required
- **Team** — optional

A supporting illustration establishes tone without requesting names, street addresses, or confidential details. Company and Location align on the first desktop row; Team spans the second row. Mobile stacks all fields.

Context is held in memory for the current page visit and included in the `guidedstoryconfirmed` event.

## Story Beats

The eight reusable Story Beats are:

1. **The Beginning** — why the contributor joined
2. **The Promise** — what they expected or were told
3. **The Good Part** — what genuinely worked
4. **The Shift** — when the experience changed
5. **The Tipping Point** — why leaving became necessary
6. **The Lesson** — what a future candidate should ask
7. **The AI Turn** — how AI or automation affected the work
8. **Who Thrives Here?** — the honest right-fit caveat

Selecting a Story Beat:

- makes it active;
- updates `aria-pressed`;
- reveals its prompt, helper, and response in the editor;
- keeps it available for revision;
- moves focus to the editor after click or tap.

Only the active beat and adjacent previews appear on desktop. Mobile shows one active beat. The numbered navigator exposes all eight beats without showing all full cards at once.

## Beat states

- **Open story beat** — unanswered
- **Answered** — contains non-empty text
- **Skipped** — deliberately skipped and available for later editing

State is communicated by text, border, and icon—not colour alone.

## Reversible navigation

- Back to Context is available from the Story Beat progress area and editor.
- Previous Beat and Next Beat move through the sequence.
- Skip Beat marks the active beat as skipped.
- The numbered navigator opens any beat.
- The Final Cut provides separate **Edit context** and **Back to Story Beats** actions.
- Each Final Cut item includes **Edit beat**.

Moving between stages does not clear entered context or responses.

## The Final Cut

The Final Cut displays:

- company;
- optional team;
- location;
- all eight Story Beat responses and states;
- one responsibility checklist;
- one safety-screen explanation;
- one final agreement checkbox.

The confirmation action emits:

```text
guidedstoryconfirmed
```

The prototype does not publish, email, or upload the story.

## Accessibility contract

- Cards and actions are semantic buttons.
- Interactive targets are at least 44px high.
- Focus indicators remain visible.
- Hidden cards are removed from keyboard navigation.
- Left and Right Arrow keys move between visible Story Beats.
- Invalid required fields receive `aria-invalid` and linked error text.
- Reduced-motion users receive the same workflow without nonessential transitions.
- No workflow uses `localStorage` or `sessionStorage`.
