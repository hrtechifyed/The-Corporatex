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
3. Purple edge light for change, AI or alternate-path moments
4. Relevant illustration or visual marker
5. Circular number, icon or status emblem
6. Short title
7. One supporting line
8. One clear action or state

Interactive cards may lift and move forward on hover, focus or selection. Informational cards remain still until expanded.

## Motion rules

- Home signal cards use a slow vertical drift.
- Guided cards form an airborne ensemble around a shared energy ring.
- The active Guided card moves forward and becomes fully readable.
- No card spins, bounces rapidly or moves continuously while the user is typing.
- `prefers-reduced-motion` removes all looping motion and transform-based emphasis without removing functionality.

## Content limits

### Home

- One headline
- One supporting sentence
- Two actions
- Five visual theme cards
- Seven theme links
- Four compact trust statements

### Share Your Story

- One decision: Guided or Free-flow
- One sentence per route
- One CTA per route

### Guided Story

Card faces use only a chapter title and one short question.

Longer prompts and examples appear in the active editor after a chapter is selected.

### Free-flow Story

The writing surface is the primary element.

Supporting benefits are reduced to one compact route strip. Context fields remain optional except for employer and a substantive story.

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
- Guided and Free-flow pages always provide a visible route switch.
- Search remains available from the shared glass navigation.
- No essential action is available only through animation, hover or colour.

## Accessibility requirements

- Interactive cards are semantic links or buttons.
- Focus states are visible.
- Selected and completed states use text as well as colour.
- Touch targets remain at least 44px high.
- Mobile layouts avoid page-level horizontal overflow.
- Guided cards become a deliberate horizontal snap sequence on small screens.
- Information disclosure uses native keyboard-accessible `<details>` controls.

## Acceptance criteria

- Every public page loads `src/cinematic-card-system.css`.
- No dense Home word cloud is present.
- Guided contains exactly eight reusable chapter cards.
- Free-flow shows the writing form before any optional visual explanation.
- Every story listing includes a relevant illustration.
- More uses four disclosure cards.
- Privacy & Safety uses six disclosure cards.
- All pages retain the exact shared navigation and two-line footer.
- No new workflow uses `localStorage` or `sessionStorage`.
- Reduced-motion users retain all navigation and editing functionality.
