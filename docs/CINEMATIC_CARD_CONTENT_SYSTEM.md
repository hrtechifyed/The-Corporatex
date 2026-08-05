# Cinematic Card and Content System

## Product principle

The platform should be a quiet, visual frame around contributor stories.

- Interface copy stays brief.
- Cards communicate one decision or idea at a time.
- Detailed explanation appears only after selection or expansion.
- User stories may remain detailed because they are the product content.

## Shared card anatomy

Every card uses the same visual grammar:

1. Dark cinematic surface
2. Orange edge light by default
3. Purple edge light for change or AI moments
4. Relevant illustration or visual marker
5. Circular number, icon or status emblem
6. Short title
7. One supporting line
8. One clear action or state

Interactive cards may lift and move forward on hover, focus or selection. Informational cards remain still until expanded.

## Motion rules

- Home signal cards use a slow vertical drift.
- Guided cards travel in one calm aerial curve from one side of a wide desktop to the other.
- The aerial journey runs only on wide screens with hover and a precise pointer.
- Hover or keyboard focus pauses the entire card formation.
- The active Guided card moves forward and becomes fully readable.
- Tablet cards use a stable grid; mobile cards use a horizontal snap journey.
- No card spins or bounces rapidly.
- `prefers-reduced-motion` removes looping motion and transform-based emphasis without removing functionality.

## Content limits

### Home

- One headline
- One supporting sentence
- Two actions
- Five visual theme cards
- Seven theme links
- Four compact trust statements

### Share Your Story

- One route: Guided Story
- One short explanation
- One primary CTA
- One prototype-state note

### Guided Story

Card faces use only a chapter title and one short question.

Longer prompts and examples appear in the active editor after a chapter is selected.

Before review, the contributor must add:

- company or organisation;
- optional broad team;
- city, country, broad region or remote-work region.

### Employer Stories

- Employer groups remain collapsible.
- Each story card includes one visual, one theme, one headline and one metadata line.
- Demonstration stories use fictional employer names.

### Story Detail

The contributor narrative may remain detailed. Platform framing stays brief.

Narrative chapters use the shared card shell to improve scanning without hiding the story.

### More and Privacy & Safety

Cards use native `<details>` and `<summary>` elements.

Only one card is open by default. All other explanation remains available without appearing as a wall of text.

## Navigation guardrails

- Home, Share Your Story, Stories, More and Privacy & Safety remain visible in the same order.
- Share Your Story remains the visual primary action.
- The website does not display a route-selection decision after the Free-flow retirement.
- Search remains available from the shared glass navigation.
- No essential action is available only through animation, hover or colour.

## Accessibility requirements

- Interactive cards are semantic links or buttons.
- Focus states are visible.
- Selected and completed states use text as well as colour.
- Touch targets remain at least 44px high.
- Moving desktop cards pause on hover and focus.
- Mobile layouts avoid page-level horizontal overflow.
- Guided cards become a deliberate horizontal snap sequence on small screens.
- Information disclosure uses native keyboard-accessible `<details>` controls.
- Required company and location fields expose linked errors and `aria-invalid`.

## Acceptance criteria

- Every public page loads `src/cinematic-card-system.css`.
- Share Your Story presents exactly one Guided entry.
- `freeflow-story.html` is not shipped.
- Guided contains exactly eight reusable chapter cards.
- Guided requires company and location; team remains optional.
- Wide desktop cards use a slow curved aerial path and pause during interaction.
- Touch, tablet, mobile and reduced-motion modes do not use the moving aerial formation.
- Every story listing includes a relevant illustration.
- More uses four disclosure cards.
- Privacy & Safety uses six disclosure cards.
- All pages retain the exact shared navigation and two-line footer.
- No workflow uses `localStorage` or `sessionStorage`.
