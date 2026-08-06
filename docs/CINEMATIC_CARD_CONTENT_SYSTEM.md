# CorporateX Cinematic Card and Content System

## Product principle

CorporateX should be cinematic while introducing the idea, quiet while someone is writing, and credible while someone is deciding.

- Interface copy stays brief.
- Every major stage has one visual anchor.
- Cards communicate one decision or idea at a time.
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

Interactive cards may lift after hover, focus, or selection. Informational cards remain still.

## Motion rules

- Page sections may use one short entrance reveal.
- Guided Story cards transition only after a deliberate Story Beat change.
- No essential element loops, orbits, bounces, crosses, or requires tracking.
- The writing field and controls remain stationary.
- `prefers-reduced-motion` removes nonessential transforms and entrance animation.

## Guided Story

The three visible stages are:

1. **Set the Scene**
2. **Story Beats**
3. **The Final Cut**

### Set the Scene

- One supporting workplace illustration
- Company and Location aligned on the first desktop row
- Optional Team across the second row
- Equal input heights and reserved error space
- One primary action: **Enter the Story Beats**

### Story Beats

- Exactly eight reusable Story Beat cards
- One active card and adjacent previews on desktop
- One active card on mobile
- One numbered navigator for direct access
- Longer guidance only inside the active editor
- Explicit **Back to context** control

### The Final Cut

- Context summary
- All Story Beat responses
- Edit action for each beat
- Separate **Edit context** and **Back to Story Beats** controls
- One safety-screen explanation and agreement

## More page

The More page is image-led rather than an accordion stack.

- One split cinematic hero
- Three visual distinction cards: Not Ratings, Not Rumours, Better Questions
- One illustrated AI-era feature panel
- Three compact trust cards
- Short copy and visible actions

## Navigation and brand guardrails

- Home, Share Your Story, Stories, More, and Privacy & Safety remain visible in the same order.
- Share Your Story points directly to `guided-story.html`.
- CorporateX is the only visible product name.
- The HRTechify logo remains the powering-brand asset.
- No non-functional Sign In control appears.
- No essential action is available only through animation, hover, or colour.

The exact footer is:

```text
CorporateX - Powered by - HRTechify - People • Technology • Growth
© 2026 All Rights Reserved.
```

## Safety-screen language

CorporateX screens direct racial slurs, abusive slang or targeted attacks, threats or graphic violence, self-harm content, and targeted abuse.

The language must also state that opinions are not moderated, employers are not protected from criticism, and contributor meaning is not rewritten.

## Acceptance criteria

- `src/cinematic-story-experience.css` is loaded on Guided Story and More.
- Guided public copy uses **Story Beat**, not “chapter.”
- The AI beat is titled **The AI Turn**.
- Context fields stay visually aligned.
- Reverse navigation exists between all three Guided stages.
- Guided cards do not use looping animation.
- More uses three image-led distinction cards and three trust cards.
- All pages retain the exact shared navigation and footer.
- No story workflow uses `localStorage` or `sessionStorage`.
