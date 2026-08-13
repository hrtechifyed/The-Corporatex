# CorporateX auth email branding

CorporateX uses Supabase Auth for passwordless contributor access. Hosted Supabase projects require the sender and hosted email templates to be configured in the Supabase Dashboard.

## Sender

Use the HRTechify mailbox already used by the project:

- Sender name: `HRTechify · CorporateX`
- Sender email: `hrtechifyed@gmail.com`
- SMTP host: `smtp.gmail.com`
- SMTP port: `587`
- SMTP username: `hrtechifyed@gmail.com`
- SMTP password: use a Google App Password created for this mailbox; never commit it to GitHub.

In Supabase: Authentication → Emails → SMTP Settings. Enable custom SMTP and enter the values above. Keep the App Password only in the Supabase secret field.

## Email subjects

Use the same clear product-level subject for first-time confirmation and returning magic-link access:

`Your private CorporateX access link`

This avoids exposing implementation details such as “Supabase Auth” or presenting contributor access as an unrelated signup flow.

## Hosted email templates

In Supabase: Authentication → Email Templates.

- **Confirm signup**: copy the contents of `supabase/templates/confirmation.html`.
- **Magic Link**: copy the contents of `supabase/templates/magic-link.html`.
- Set both subjects to `Your private CorporateX access link`.

Both templates use `{{ .ConfirmationURL }}` and `{{ .Email }}`, which are supported Supabase Auth template variables.

## Product intent

Contributor authentication exists only to:

1. associate drafts/submissions with the correct private account,
2. let a contributor see only their own story status,
3. securely continue or submit a story.

Reading published CorporateX stories does not require authentication, and a contributor email must never be included in public story output.
