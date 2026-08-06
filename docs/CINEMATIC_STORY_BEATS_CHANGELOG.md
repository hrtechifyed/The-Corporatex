# Cinematic Story Beat Redesign

## Scope

This change converts the Guided Story experience from a form-led journey into a cinematic but calm story editor.

## Public changes

- User-facing “chapter” terminology is replaced with **Story Beat**.
- **The AI Chapter** is renamed **The AI Turn**.
- Set the Scene includes a supporting illustration and aligned Company, Location, and optional Team fields.
- Story Beats show one active card and nearby previews rather than all cards at once.
- The Final Cut provides separate routes back to Context and Story Beats.
- More becomes an image-led explainer with three visual distinction cards, an AI-era feature, and three trust cards.

## Interaction contract

The contributor can move between Set the Scene, Story Beats, and The Final Cut without losing in-memory input. Motion is limited to short transitions after user actions and is removed for reduced-motion users.

## Verification

Run:

```bash
npm run check
```
