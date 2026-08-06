# CorporateX Guided Experience Lock

## Public route

The story-submission experience has one public destination:

- `guided-story.html`

Every visible **Share Your Story** link must point directly to that page. `share-story.html` remains a compatibility redirect and `freeflow-story.html` remains retired.

## Journey stages

The page exposes one stage at a time:

1. **Set the Scene**
2. **Story Beats**
3. **The Final Cut**

The context form, Story Beat stage, editor, and Final Cut must not compete in the same viewport by default.

## Set the Scene

The opening stage is an image-led cinematic panel rather than a plain form.

Required:

- company or organisation;
- broad location such as city and country, remote region, or hybrid location.

Optional:

- broad team or function.

Desktop field placement is:

```text
Company | Location
Team across full width
```

All inputs use the same height, label structure, error space, and baseline. Mobile stacks the fields in the order Company, Location, Team.

The illustration supports the setting without requesting a street address, another person's identity, or confidential information.

## Story Beats

The journey contains exactly eight reusable Story Beats:

1. The Beginning
2. The Promise
3. The Good Part
4. The Shift
5. The Tipping Point
6. The Lesson
7. The AI Turn
8. Who Thrives Here?

Only the active Story Beat and its immediate previous and next previews are visible on desktop. Mobile shows only the active Story Beat. An eight-button navigator allows direct revisiting without exposing all full cards at once.

Cards do not loop, orbit, cross, or float continuously. Motion is limited to a controlled transition after a user action. Reduced-motion users receive the same workflow without transforms.

The editor displays the active prompt, helper, response field, character count, Previous Beat, Next Beat, Skip Beat, Back to Context, and Final Cut actions.

## Reversible navigation

The contributor can always:

- return from Story Beats to Set the Scene;
- return from The Final Cut to Story Beats;
- return from The Final Cut to Set the Scene;
- revisit any Story Beat through the numbered navigator;
- edit an individual Story Beat from The Final Cut.

Context and responses remain in memory while moving between stages.

## The Final Cut

The Final Cut displays:

- company;
- optional team;
- location;
- all eight Story Beat states and responses;
- one final responsibility agreement;
- the exact safety-screen boundary;
- separate **Edit context** and **Back to Story Beats** actions.

## Safety-screen boundary

CorporateX does not moderate opinions or protect employers from criticism.

The planned safety screen is limited to:

- direct racial slurs;
- abusive slang or targeted attacks;
- threats or graphic violence;
- self-harm content;
- targeted abuse.

Contributors may still describe that discrimination, harassment, violence, abuse, or self-harm-related workplace impact occurred without reproducing slurs or graphic details.

## Confirmation event

The prototype emits:

```text
guidedstoryconfirmed
```

The event contains validated context, Story Beat review data, and progress. It does not represent upload, publication, or server persistence.

## Brand and change control

Visible product naming uses **CorporateX** and the shared footer remains:

```text
CorporateX - Powered by - HRTechify - People • Technology • Growth
© 2026 All Rights Reserved.
```

`tests/site-quality.mjs` must fail if a change restores user-facing “chapter” language, removes the context illustration, misaligns the context fields, removes reverse navigation, restores continuous card animation, or changes the exact shared footer.

Run:

```bash
npm run check
```
