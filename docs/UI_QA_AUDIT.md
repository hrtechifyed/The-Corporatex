# UI and Product QA Audit

## Scope

Audited the current public experience across:

- Home
- Share Your Story
- Guided Story
- Employer Stories
- Story Detail
- More
- Privacy & Safety

## Current product decisions

### 1. One submission route

**Decision:** Free-flow Story is retired. Share Your Story now presents one Guided entry and `freeflow-story.html` is not shipped.

**Reasoning:** One route reduces decision friction, simplifies moderation inputs and keeps the product focused on structured, useful exit accounts.

### 2. Required context before review

**Problem:** Chapter responses alone did not reliably identify the employer context readers need.

**Resolution:** Guided Story now asks for:

- company or organisation — required;
- team — optional;
- location — required, with broad city, country, remote-region and hybrid examples.

Review is blocked until company and location are valid. The context is included in the `guidedstoryconfirmed` integration event.

### 3. Guided card sizing and motion

**Problem:** Eight equal cards in a dense row made the page feel full and visually static.

**Resolution:**

- Cards use a smaller, more readable footprint.
- On wide desktop screens with hover and a precise pointer, cards travel slowly along a shallow edge-to-edge curve.
- The full journey lasts 96 seconds and reverses rather than jumping.
- Hover and focus pause the entire formation.
- Tablet uses a stable grid.
- Mobile uses a horizontal snap journey.
- Touch-only and reduced-motion environments receive no moving formation.

### 4. Guided interaction

- Each chapter is a semantic button.
- Selecting a card opens the chapter editor.
- Responses remain in memory for the current page visit.
- Answered and skipped states are visible in text as well as colour.
- Previous, next, skip and direct-card navigation are supported.
- Left and Right Arrow keys move between cards.
- A progress bar reports answered and skipped chapters.
- Review mode groups context and all chapters and supports editing.

### 5. Footer and navigation consistency

Every public page uses the same compact HRTechify glass navigation and exactly:

1. `The Corporate Ex - Powered by - HRTechify - People • Technology • Growth`
2. `© 2026 All Rights Reserved.`

Both footer lines use the same type size, weight and alignment.

### 6. Demonstration content

Fictional employer examples remain:

- Northstar Technologies
- Atlas Systems
- Meridian Works

A page-level notice explains that these are demonstration accounts rather than employee submissions.

### 7. Prototype persistence

Guided Story states that context and writing remain only in the open page. Confirmation dispatches an integration event but does not claim publication or database storage.

### 8. Accessibility and motion

- Semantic buttons and labels
- Visible focus states
- `aria-pressed`, `aria-live`, `aria-invalid` and progress semantics
- Linked errors for company and location
- Arrow-key chapter navigation
- 44px+ touch targets
- Text labels for answered and skipped states
- Interaction pauses desktop motion
- Reduced-motion rules remove animation without removing functionality

## Product behaviour boundary

This remains a front-end prototype. The confirmation action emits:

```text
guidedstoryconfirmed
```

No story is published or sent to a server until a moderated database workflow is connected.

## Release acceptance criteria

- Share Your Story presents one Guided route only.
- The retired Free-flow HTML page is absent from the production build.
- All eight Guided chapters can be selected, answered, skipped, revisited and reviewed.
- Company and location are required; team remains optional.
- Wide desktop card movement is slow, curved and pausable.
- Tablet, touch, mobile and reduced-motion experiences remain stable.
- One final agreement checkbox is used.
- All public pages share the same navigation and exact footer.
- Demonstration employers are fictional.
- No story workflow uses `localStorage` or `sessionStorage`.
- `npm run check` passes before deployment.
