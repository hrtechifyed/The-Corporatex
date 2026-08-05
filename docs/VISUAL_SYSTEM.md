# Visual and Motion System

## Design goal

Keep the anime and glass identity memorable without making the interface compete with the story.

## Type scale

| Level | Usage |
| --- | --- |
| Hero | Home and route-choice headline only |
| Page title | Guided, Free-flow, directory and story detail |
| Section title | Form sections, policy topics and information cards |
| Body | Explanations, fields and story context |

The shared CSS variables are:

- `--type-hero`
- `--type-page`
- `--type-section`
- `--type-body`

## Motion rules

- Use no more than one prominent continuous motion zone in a viewport.
- Story-card motion should use 12–20 second loops.
- Image pan and zoom should use 16–24 second loops.
- Pause ambient movement while the user focuses or hovers.
- Disable all looping motion when `prefers-reduced-motion: reduce` is active.
- Motion should communicate focus or depth, not urgency.

## Image rules

- Use SVG or high-resolution WebP.
- Never stretch or blur the HRTechify logo.
- Give images explicit dimensions to reduce layout shift.
- Lazy-load below-the-fold raster imagery.
- Every anime scene must communicate the card topic rather than act as generic decoration.

## Viewport hierarchy

Each viewport should have:

1. one dominant heading;
2. one primary action;
3. one visually active component;
4. lower-contrast supporting elements.

## Review checklist

- Is any text competing with the active story or form field?
- Are multiple loops moving at the same time?
- Is the logo crisp at 2× display density?
- Does reduced-motion mode remain complete and readable?
- Does each illustration add meaning?
- Are page titles and section titles consistent across routes?
