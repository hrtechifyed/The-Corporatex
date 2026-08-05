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
- the existing crisp anime scene system in `public/story-scenes.svg`

They do not load the previous form, carousel, progressive-disclosure or theme-decision runtimes.

## Locked composition

### Home

- Glass HRTechify navigation
- “Before you join, learn from those who left.”
- Anime doorway hero
- One Share Your Story action
- “Open for everyone”
- Orbital “What others talk about” word cloud
- Four trust statements
- Compact single-line footer

### Share Your Story

- One centred question
- Guided Story card in orange
- Free-flow Story card in purple
- Large anime scene on each card
- One start action per card
- “You can switch anytime.”

### Guided Story

- Centred Guided Story heading
- Eight image-led chapter cards
- Orange and purple accent treatment shown in the reference
- Three progress dots
- Free-flow switching note
- No form, sidebar, optional-theme carousel or extra explanatory section

### Free-flow Story

- Centred Free-flow Story heading
- One large anime writing scene
- Four compact supporting ideas
- Guided switching note
- No form, carousel or additional content block

## Change control

Changes to these four pages should be rejected unless the user explicitly supplies a new visual reference or asks to unlock a specific element. Copy, section count, colour roles and content hierarchy are covered by `tests/site-quality.mjs`.

## Responsive interpretation

The desktop composition is preserved at wide viewports. At smaller widths, the same components reflow without introducing new content:

- navigation becomes a compact menu;
- the two choice cards stack;
- guided cards become a horizontal snap row;
- free-flow features become a two-column grid;
- no horizontal page overflow is allowed.

## Validation

Run:

```bash
npm run check
```

The fidelity test confirms the locked copy, section counts, scene references, dedicated runtime, responsive rules and absence of legacy form/carousel modules.
