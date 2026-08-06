# CorporateX UI and Product QA Audit

## Scope

Audited the public experience across:

- Home
- Guided Story
- Employer Stories
- Story Detail
- More
- Privacy & Safety

## Decisions implemented

### 1. Product name

The public product name is **CorporateX**.

The HRTechify logo remains the powering-brand asset. The product name beside it, browser titles, visible copy, and shared footer use CorporateX.

### 2. Direct story entry

Every visible **Share Your Story** action points directly to `guided-story.html`.

`share-story.html` is a compatibility redirect only. It must not add another card, question, or start button.

### 3. Staged Guided journey

The page exposes one stage at a time:

1. Context
2. Story chapters
3. Review

This prevents the company fields, eight chapters, editor, and review controls from competing on one crowded page.

### 4. Focused chapter presentation

Only the active chapter and immediate previous and next previews are visible on desktop. Mobile displays only the active chapter.

An eight-button chapter navigator supports direct revisiting. Cards transition only when the user changes chapters. There is no continuous orbit, curve travel, looping float, or movement while writing.

### 5. Required context

Before the chapter journey begins, contributors provide:

- company or organisation — required;
- team — optional;
- broad location — required.

Street addresses and another person’s identity are not requested.

### 6. Safety screening only

CorporateX does not moderate whether a contributor’s opinion is positive, negative, fair, or favourable to an employer.

The safety screen is limited to:

- direct racial slurs;
- abusive slang or targeted attacks;
- threats or graphic violence;
- self-harm content;
- targeted abuse.

A contributor may still describe that discrimination, harassment, violence, abuse, or self-harm-related workplace impact occurred without reproducing slurs or graphic details.

### 7. Demonstration clarity

Northstar Technologies, Atlas Systems, Meridian Works, and all displayed accounts remain fictional demonstrations.

Home and Stories state this before readers encounter the examples. The story detail page repeats that it is not an employee submission.

### 8. Account UI

The non-functional Sign In control is removed until accounts and saved drafts exist.

### 9. Prototype state

Writing remains only in memory for the current page visit. Confirmation emits `guidedstoryconfirmed` but does not upload, publish, or claim that a reviewer received the story.

### 10. Shared shell

Every public page uses the same navigation order and footer:

```text
CorporateX - Powered by - HRTechify - People • Technology • Growth
© 2026 All Rights Reserved.
```

## Acceptance criteria

- CorporateX is the only visible product name.
- Every visible Share action opens Guided Story directly.
- Free-flow remains retired.
- The compatibility Share page redirects immediately.
- Context, chapters, and review are separate stages.
- Only the active and adjacent chapter cards are visible on desktop.
- No Guided card uses continuous animation.
- Company and location are required; team remains optional.
- Safety screening is not presented as opinion moderation.
- Fictional examples are unmistakable.
- No non-functional Sign In control appears.
- No story workflow uses `localStorage` or `sessionStorage`.
- `npm run check` passes before deployment.
