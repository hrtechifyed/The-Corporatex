# CorporateX safety review email contract

## Recipient

Moderator alerts are sent to the server-side environment variable:

```text
MODERATION_ALERT_EMAIL=hrtechifyed@gmail.com
```

The address is not exposed through a `NEXT_PUBLIC_` variable.

## Standard subject

Every safety alert uses this format:

```text
[CorporateX Safety Review] Submission {SHORT_ID} requires review
```

`SHORT_ID` is the first eight alphanumeric characters of the submission UUID, uppercased.

The subject deliberately excludes:

- employer name;
- contributor identity;
- location;
- story text;
- the flagged expression;
- the safety category.

This keeps inbox previews privacy-safe while making alerts searchable.

## Trigger

The current production scaffold sends an alert only when the contributor-approved AI analysis contains one or more values in `possibleAbusiveContent`.

A clear submission does not generate a moderator email.

Email is a notification channel only. The database status and protected moderation workspace remain the source of truth if delivery fails.

## Email body

The email contains only:

- the full submission ID;
- the number of safety indicators;
- a protected moderation-workspace link.

Raw story text and flagged expressions are never copied into the email.

## Provider configuration

The implementation uses the Resend HTTPS API without adding a package dependency.

Required server-side variables:

```text
RESEND_API_KEY=
MODERATION_FROM_EMAIL=CorporateX Safety <safety@your-verified-domain.example>
MODERATION_ALERT_EMAIL=hrtechifyed@gmail.com
MODERATION_ALERT_SUBJECT_PREFIX=[CorporateX Safety Review]
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
```

`MODERATION_FROM_EMAIL` must use a sender/domain verified with the transactional email provider.

## Failure behaviour

A provider failure does not discard or reject the submission. The story remains in `pending_moderation`, the failure is logged server-side, and the moderation workspace remains available.
