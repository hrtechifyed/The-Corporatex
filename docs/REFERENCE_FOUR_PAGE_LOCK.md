# Four-Page Reference Lock

## Source of truth

The approved composite supplied on 5 August 2026 is the visual source of truth for:

1. `index.html`
2. `share-story.html`
3. `guided-story.html`
4. `freeflow-story.html`

These pages deliberately use a dedicated stylesheet and runtime:

- `src/reference-exact.css`
- `src/reference-exact.js`
- `src/reference-art-lock-1.js` through `src/reference-art-lock-8.js`

The eight artwork modules contain twelve image crops derived from the approved composite: the Home hero, both Share Your Story choices, the Free-flow hero and eight Guided Story chapter scenes. At page load, the runtime joins the modules into one hidden SVG sprite so each page renders the supplied artwork without relying on an external asset service.

The four locked pages do not load the previous form, carousel, progressive-disclosure, beta-content or theme-decision runtimes.

## Locked composition

### Home

- Glass HRTechify navigation
- “Before you join, learn from those who left.”
- Anime doorway hero from the approved composite
- One Share Your Story action
- “Open for everyone”
- Orbital “What others talk about” word cloud
- Four trust statements
- Compact single-line footer

### Share Your Story

- One centred question
- Guided Story card in orange
- Free-flow Story card in purple
- The exact supplied anime scene on each card
- One start action per card
- “You can switch anytime.”

### Guided Story

- Centred Guided Story heading
- Eight image-led chapter cards using the supplied crops
- Orange and purple accent treatment shown in the reference
- Three progress dots
- Free-flow switching note
- No form, sidebar, optional-theme carousel or extra explanatory section

### Free-flow Story

- Centred Free-flow Story heading
- The supplied large anime writing scene
- Four compact supporting ideas
- Guided switching note
- No form, carousel or additional content block

## Change control

Changes to these four pages should be rejected unless the user explicitly supplies a new visual reference or asks to unlock a specific element. Copy, section count, colour roles, artwork IDs and content hierarchy are covered by `tests/site-quality.mjs`.

## Responsive interpretation

The desktop composition is preserved at wide viewports. At smaller widths, the same components reflow without introducing new content:

- navigation becomes a compact menu;
- the two choice cards stack;
- Guided cards become a horizontal snap row;
- Free-flow features become a two-column grid;
- no horizontal page overflow is allowed.

## Validation

Run:

```bash
npm run check
```

The fidelity test confirms the locked copy, section counts, twelve embedded artwork symbols, dedicated runtime, responsive rules and absence of legacy form/carousel modules.
