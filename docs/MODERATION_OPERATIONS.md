# CorporateX moderation operations

This runbook describes the production workflow for HRTechify moderators. CorporateX production runs on GitHub Pages and uses Supabase for private authentication, story records, moderation state and transactional email jobs.

## 1. When a contributor submits

1. The contributor completes the four-ending choice, context and Story Beats.
2. A returning contributor must be authenticated with the existing CorporateX email and password before `submit-story` can accept the submission. A new contributor creates an email/password account and confirms ownership of the email address once.
3. The story becomes `pending_moderation`. It is visible only to its contributor and moderators; it is not in the public Stories archive.
4. The contributor receives the CorporateX “story received — now in review” email.
5. `hrtechifyed@gmail.com` receives a moderation alert. Raw Story Beat text is intentionally not copied into the email.
6. Use **Review submission** in that email to open `moderation.html?id=<experience-id>`.

## 2. Moderator access

- Sign in with the HRTechify CorporateX account.
- The account must have an active `profiles.role = 'moderator'` record.
- The moderator console never displays contributor email addresses. It works with the anonymous HRT contributor identity and private story record.
- Do not share moderator credentials or leave the console open on a shared device.

## 3. Review the submission

The private console shows:

- submission ID and anonymous HRT contributor ID;
- employer, selected ending, broad function and validated location;
- Story Beat responses;
- automated privacy/safety signals;
- suggested theme labels;
- public headline and summary preview;
- prior moderation actions and internal notes.

Check the story for identifying personal information, confidential material, unsupported accusations, threats/abuse, clarity and whether the public headline/summary accurately reflect the contributor’s own account.

## 4. Approve & Publish

1. Clean the public headline/summary if needed without changing the meaning of the contributor’s story.
2. Select **Approve & Publish**.
3. Confirm the publication action.
4. CorporateX records a `publish` moderation action, creates the public slug and publication timestamp, and changes the story to `published` atomically.
5. The story becomes eligible for the public Stories archive.
6. The notification queue sends the contributor **Your CorporateX story is now published** with a link to the public story.

## 5. Request Changes

Use this when the story can likely be published after a contributor edit.

1. Enter a specific, respectful contributor-facing message. Example: “Please remove the manager’s name from Story Beat 3 and make the dates less specific. Everything else is ready for another review.”
2. Optionally add a separate internal HRTechify note. Internal notes are never shown to the contributor.
3. Select **Request changes** and confirm.
4. CorporateX records the moderation action and changes the story to `changes_requested`.
5. The contributor receives **CorporateX needs a small change before we can publish your story** with the exact contributor-facing note and a private revision link.
6. In **My Space → My Submissions**, the contributor also sees **Changes requested**, the HRTechify note and **Review requested changes**.
7. The contributor edits the existing Story Beats and selects **Resubmit for moderation**. This updates the same story; it does not create a duplicate.
8. The story returns to `pending_moderation` and both HRTechify and the contributor receive resubmission notifications.
9. Review the revised version again and choose Publish, Request Changes again, or Reject.

## 6. Reject

Use Reject when the current contribution should not move into the public archive and a normal revision cycle is not appropriate.

1. Enter a clear contributor-facing explanation. This is required.
2. Add an internal HRTechify reason if useful for the audit trail.
3. Select **Reject** and confirm.
4. CorporateX records the `reject` action and sets status to `rejected`.
5. The story remains private and is never exposed in Stories.
6. The contributor receives a branded moderation-update email and can see the final status in My Space.

## 7. Audit trail

Every moderator decision is recorded in `moderation_actions` with the experience ID, moderator ID, action, timestamp, optional private HRTechify reason and, where relevant, the contributor-facing message.

Never place private contributor contact information into a public headline, public summary, public labels or moderator contributor-facing notes.

## 8. Location validation

The guided-story location field is not free text. It is backed by `story_locations` and narrows major-city/remote-region suggestions with every typed character. The contributor must select one of the returned values. `experiences.broad_region` also has a foreign-key constraint to `story_locations`, so arbitrary browser-bypassed text cannot be persisted.

If a legitimate major city is missing, add it to the controlled location catalogue through a reviewed database migration rather than temporarily accepting arbitrary text.
