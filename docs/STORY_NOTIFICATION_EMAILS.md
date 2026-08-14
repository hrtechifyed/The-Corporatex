# CorporateX story notification emails

CorporateX uses branded private transactional notifications throughout the contributor and moderation lifecycle, in addition to first-account email confirmation.

## Branding contract — applies to every CorporateX email

Every application email must:

- use a subject line that clearly includes `CorporateX`;
- use the sender identity `HRTechify · CorporateX`;
- use the CorporateX black/gold visual treatment where HTML email is supported;
- identify the product as `CorporateX by HRTechify`;
- include the line `Not a score. A sequence.`;
- avoid exposing contributor identity or raw Story Beat text unless the workflow explicitly requires information the recipient already owns.

CI treats this as a regression contract. New transactional email paths should not ship with generic Supabase, Gmail, or unbranded product copy.

## Contributor: story received

**Subject:** `CorporateX received your story — now in review`

The email explains which employer the story is about, the chosen ending, and how many Story Beats were answered. It tells the contributor that the story is private, moderation happens before publication, their email is never shown publicly, and CorporateX will email again if the story is approved. It links to My Space.

## HRTechify: new moderation item

**Subject:** `[CorporateX] New story submitted for moderation — {SHORT_ID}`

Sent to `hrtechifyed@gmail.com`. It includes the submission ID and only broad review context such as employer, ending, Story Beat count and broad region. Raw private Story Beat text is intentionally excluded from email.

## Contributor: changes requested

**Subject:** `CorporateX needs a small change before we can publish your story`

The contributor receives the moderator-facing change request, is reminded that the story remains private, and gets a link back to the authenticated revision flow.

## Contributor: resubmission received

**Subject:** `CorporateX received your updated story — back in review`

Confirms that requested edits were received and that the same story has returned to private moderation.

## Contributor: review not approved

**Subject:** `An update on your CorporateX story review`

Explains that the story will not be published in its current form and keeps the contributor-facing moderation note private inside the contributor lifecycle.

## Contributor: publication approved

**Subject:** `Your CorporateX story is now published`

Sent when moderation changes the story to `published`. It confirms that the story is in the public Stories archive, links to the GitHub Pages story detail page and reminds the contributor that their account email remains private.

## Contributor: permanent story deletion

**Subject:** `Your CorporateX story has been permanently deleted`

Sent only after an authenticated contributor confirms permanent deletion in My Space and the deletion transaction succeeds. The receipt contains no deleted story text, employer name, headline or Story Beats. It confirms that the selected story and associated story data were removed from CorporateX, cannot be restored, and no longer appear in My Space, Stories or the homepage. The contributor account itself remains active.

The deletion receipt is processed from a private retry queue. Once the email is successfully sent, the deletion-email job itself is removed so CorporateX does not retain story content or a permanent deletion-job record merely for the receipt.
