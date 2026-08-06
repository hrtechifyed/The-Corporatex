# CorporateX safety review email contract

## Delivery method

CorporateX uses the same email-delivery pattern as GrowWithHR Version 2:

1. A Google OAuth 2.0 client is configured for the Gmail account.
2. A long-lived refresh token is stored server-side.
3. CorporateX builds a MIME email with text and HTML alternatives.
4. The message is Base64URL-encoded.
5. The Gmail API sends it through `gmail.users.messages.send` with `userId: "me"`.

No Resend account, API key, or verified transactional-email domain is used.

## Sender and recipient

```text
GMAIL_USER=hrtechifyed@gmail.com
MODERATION_ALERT_EMAIL=hrtechifyed@gmail.com
```

Both values are server-side. The Google OAuth refresh token must belong to the same account configured as `GMAIL_USER`.

## Standard subject

Every safety alert uses this format:

```text
[CorporateX Safety Review] Submission {SHORT_ID} requires review
```

`SHORT_ID` is the first eight alphanumeric characters of the submission UUID, uppercased.

The subject excludes employer name, contributor identity, location, story text, flagged expressions, and safety category.

## Trigger

An alert is sent only when the contributor-approved AI analysis contains one or more entries in `possibleAbusiveContent`.

A clear submission does not generate a moderator email. Email is a notification channel only; the database record and protected moderation workspace remain the source of truth.

## Email body

The email contains only:

- the full submission ID;
- the number of safety indicators;
- a protected moderation-workspace link.

Raw story text and flagged expressions are never copied into the email.

## Required environment variables

```text
GMAIL_USER=hrtechifyed@gmail.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
MODERATION_ALERT_EMAIL=hrtechifyed@gmail.com
MODERATION_ALERT_SUBJECT_PREFIX=[CorporateX Safety Review]
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
```

All credentials must be configured in the production host's server-side environment settings. Never commit real credentials to GitHub and never prefix them with `NEXT_PUBLIC_`.

## Google setup summary

- Create or reuse the same Google Cloud OAuth project pattern used by GrowWithHR Version 2.
- Enable the Gmail API.
- Create an OAuth client.
- Authorize `hrtechifyed@gmail.com` with Gmail send permission.
- Generate a refresh token for that account.
- Store the client ID, client secret, and refresh token in the production environment.

## Failure behaviour

A Gmail API failure does not discard or reject the submission. The story remains in `pending_moderation`, the error is logged server-side, and the moderation workspace remains available.
