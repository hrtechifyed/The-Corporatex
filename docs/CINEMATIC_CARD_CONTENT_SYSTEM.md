# CorporateX Cinematic Card and Content System

## Product principle

CorporateX should be cinematic while introducing the idea, quiet while someone is writing, and credible while someone is deciding.

- Interface copy stays brief.
- Cards communicate one decision or idea at a time.
- Detailed explanation appears only after selection or expansion.
- Contributor stories may remain detailed because they are the product content.
- Motion must never compete with reading, writing, or form completion.

## Shared card anatomy

Every card uses the same visual grammar:

1. Dark cinematic surface
2. Orange edge light by default
3. Purple edge light for change or AI moments
4. Relevant illustration or visual marker
5. Circular number, icon, or status emblem
6. Short title
7. One supporting line
8. One clear action or state

Interactive cards may lift on hover, focus, or selection. Informational cards remain still until expanded.

## Motion rules

### Marketing and discovery pages

- Home signal cards may use a slow, low-amplitude drift.
- Hover and focus may add controlled depth.
- No element should require tracking or chasing a moving target.

### Guided Story

- Only the active chapter and immediate previous and next previews are visible on desktop.
- Mobile shows the active chapter only.
- Chapter changes use one controlled transition.
- Cards do not orbit, travel along a path, loop, float continuously, cross, or reorder.
- The writing field and its surrounding controls remain stationary.
- `prefers-reduced-motion` removes transform-based transitions without removing functionality.

## Content limits

### Home

- One headline
- One supporting sentence
- Two actions
- Five visual theme cards
- Seven theme links
- Four compact trust statements
- One visible fictional-example note

### Guided Story

- Three visible stages: Context, Story chapters, Review
- Company and location required
- Team optional
- One active chapter question
- Previous and next previews on desktop only
- One eight-button chapter navigator
- Longer prompt and helper text in the active editor
- One final safety-screen explanation and agreement

### Employer Stories

- Employer groups remain collapsible.
- Each story card includes one visual, one theme, one headline, and one metadata line.
- Demonstration stories use fictional employer names.
- The page labels all current examples before the list begins.

### Story Detail

The narrative may remain detailed. Platform framing stays brief.

The page must show:

- whether the story is fictional or genuine;
- that it represents one perspective;
- the safety-screen boundary;
- a clear next action.

### More and Privacy & Safety

Cards use native `<details>` and `<summary>` elements.

Only one card is open by default. All other explanation remains available without appearing as a wall of text.

## Navigation guardrails

- Home, Share Your Story, Stories, More, and Privacy & Safety remain visible in the same order.
- Share Your Story points directly to `guided-story.html`.
- `share-story.html` is a redirect only.
- Search remains available from the shared glass navigation.
- The product does not display a non-functional Sign In control.
- No essential action is available only through animation, hover, or colour.

## Brand guardrails

- Visible product naming uses **CorporateX**.
- The HRTechify logo remains the powering-brand asset.
- The exact footer is:

```text
CorporateX - Powered by - HRTechify - People • Technology • Growth
© 2026 All Rights Reserved.
```

## Safety-screen language

CorporateX screens direct racial slurs, abusive slang or targeted attacks, threats or graphic violence, self-harm content, and targeted abuse.

The language must also state that:

- experiences of discrimination, harassment, violence, abuse, or self-harm-related workplace impact may still be described without reproducing slurs or graphic details;
- opinions are not moderated;
- employers are not protected from criticism;
- contributor meaning is not rewritten.

## Accessibility requirements

- Interactive cards are semantic links or buttons.
- Focus states are visible.
- Selected, answered, and skipped states use text as well as colour.
- Touch targets remain at least 44px high.
- Hidden chapter cards are removed from keyboard navigation.
- The chapter navigator provides direct access to all eight chapters.
- Mobile layouts avoid page-level horizontal overflow.
- Information disclosure uses native keyboard-accessible `<details>` controls.
- Required company and location fields expose linked errors and `aria-invalid`.

## Acceptance criteria

- Every public page loads `src/cinematic-card-system.css`.
- CorporateX is the only visible product name.
- Every visible Share action opens Guided Story directly.
- Free-flow is not shipped.
- Guided contains exactly eight reusable chapter cards.
- Guided shows at most three full cards on desktop and one on mobile.
- Guided cards do not use looping animation.
- Company and location are required; team remains optional.
- Every story listing includes a relevant illustration.
- More uses four disclosure cards.
- Privacy & Safety uses six disclosure cards.
- All pages retain the exact shared navigation and two-line footer.
- No workflow uses `localStorage` or `sessionStorage`.
