# Accessibility and Performance Gates

## Accessibility target

The controlled beta targets WCAG 2.2 AA.

Required behaviour:

- document language and viewport metadata;
- one clear `h1` per page;
- labelled navigation landmarks;
- a working skip link;
- visible keyboard focus;
- explicit button types;
- alt attributes on every image;
- accessible pressed and expanded states;
- helper text associated with form controls;
- minimum 44px interactive targets;
- complete reduced-motion support;
- usable forced-colours presentation.

Run:

```bash
npm run test:a11y
```

## Performance budgets

| Resource | Budget |
| --- | ---: |
| Total JavaScript in `src/` | 180 KB |
| Total CSS in `src/` | 240 KB |
| Largest HTML page | 60 KB |
| Largest image or SVG asset | 500 KB |

Run:

```bash
npm run test:performance
```

These static budgets complement, but do not replace, browser measurements.

## Browser release targets

| Metric | Target |
| --- | ---: |
| Lighthouse Performance | 90+ |
| Lighthouse Accessibility | 95+ |
| Lighthouse Best Practices | 95+ |
| Lighthouse SEO | 90+ |
| Largest Contentful Paint | under 2.5s |
| Cumulative Layout Shift | under 0.1 |
| Interaction to Next Paint | under 200ms |

## Full local gate

```bash
npm run check
```

This runs syntax checks, content and trust tests, accessibility checks, performance budgets and the static production build.

## Responsive matrix

Review at 320, 360, 390, 430, 768, 1024 and 1440 pixels. Confirm:

- no page-level horizontal overflow;
- 44px touch targets;
- navigation does not cover headings;
- forms remain single-column where needed;
- the intentional story-card carousel scrolls horizontally;
- text remains readable without zooming;
- motion is removed when the operating system requests reduced motion.
