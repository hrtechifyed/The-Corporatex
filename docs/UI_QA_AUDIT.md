# UI and Product QA Audit

## Scope

Audited the public experience across:

- Home
- Share Your Story
- Guided Story
- Free-flow Story
- Employer Stories
- Story Detail
- More
- Privacy & Safety

## Issues found and resolution

### 1. Guided Story cards were decorative

**Problem:** The eight chapter cards were static `<article>` elements. Mouse, touch and keyboard users could not select a chapter or write an answer.

**Resolution:**

- Each chapter is now a semantic button.
- Selecting a card opens the chapter editor.
- Responses are held in memory for the current page visit.
- Answered and skipped states are visible in text as well as colour.
- Previous, next, skip and direct-card navigation are supported.
- Left and Right Arrow keys move between cards.
- A progress bar reports answered and skipped chapters.
- Review mode groups all chapters and supports editing.

### 2. Free-flow Story had no writing surface

**Problem:** The page showed an illustration and four benefits but provided no form or textarea.

**Resolution:**

- Added employer, role, tenure and region context.
- Added an optional title and theme.
- Added a 3,000-character first-person writing field.
- Added validation and an accessible live error summary.
- Added review, edit and confirmation modes.
- Added one final responsibility agreement checkbox.

### 3. Footer varied or was missing

**Problem:** Home used a single-line custom footer while Share, Guided and Free-flow had no footer. Other pages used a two-line footer.

**Resolution:** Every public page now uses exactly:

1. `The Corporate Ex - Powered by - HRTechify - People • Technology • Growth`
2. `© 2026 All Rights Reserved.`

Both lines use the same type size, weight and alignment.

### 4. Navigation changed between page groups

**Problem:** The four reference pages used one menu while Stories, Story Detail, More and Privacy used a different, larger shell.

**Resolution:** All audited public pages now use the same compact HRTechify glass navigation, mobile panel, active-page state and open-access Sign In message.

### 5. Demonstration stories used real employer names

**Problem:** Fictional examples were attached to Sony and NVIDIA, creating avoidable trust and legal ambiguity even with preview labels.

**Resolution:** Replaced all demonstration employers with fictional names:

- Northstar Technologies
- Atlas Systems
- Meridian Works

A single page-level notice explains that the examples are fictional. Repeated preview chips were removed.

### 6. Prototype persistence was unclear

**Problem:** Users could reasonably assume their writing was saved or submitted.

**Resolution:** Guided and Free-flow pages explicitly state that drafts remain only in the open page. Confirmation dispatches an integration event but does not claim publication or database storage.

### 7. Accessibility and motion gaps

**Problem:** Static cards had no keyboard interaction, status announcements or reduced-motion equivalent.

**Resolution:**

- Semantic buttons and labels
- Visible focus states
- `aria-pressed`, `aria-live`, `aria-invalid` and progress semantics
- Arrow-key chapter navigation
- 44px+ touch targets
- Text labels for answered and skipped states
- Reduced-motion rules that remove transforms and looping animation without removing functionality

## Product behaviour boundary

This remains a front-end prototype. The confirmation actions emit:

- `guidedstoryconfirmed`
- `freeflowstoryconfirmed`

No story is published or sent to a server until a moderated database workflow is connected.

## Release acceptance criteria

- All eight Guided chapters can be selected, answered, skipped, revisited and reviewed.
- Free-flow accepts and validates a substantive first-person account.
- One final agreement checkbox is used in each route.
- All public pages share the same navigation and exact footer.
- Demonstration employers are fictional.
- No new story workflow uses `localStorage` or `sessionStorage`.
- Keyboard, touch, mouse and reduced-motion behaviour remain functional.
- `npm run check` passes before deployment.
