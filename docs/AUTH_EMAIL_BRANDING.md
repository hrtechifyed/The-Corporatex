# CorporateX account email branding

CorporateX uses Supabase Auth for email-and-password accounts. Readers do not need an account to browse published stories.

## Sender

Use the HRTechify mailbox already configured for the project:

- Sender name: `HRTechify · CorporateX`
- Sender email: `hrtechifyed@gmail.com`
- SMTP host: `smtp.gmail.com`
- SMTP port: `587`
- SMTP username: `hrtechifyed@gmail.com`
- SMTP password: a Google App Password stored only in Supabase; never commit it.

## First-account confirmation

New contributors create an account with an email and a password of at least 10 characters. If email confirmation is enabled, the first account email is a one-time ownership check. It is **not** used for future sign-in.

Use this subject for **Confirm signup**:

`Confirm your CorporateX account & submit your story`

Use `supabase/templates/confirmation.html` as the hosted Confirm signup template.

The email must make clear that:

- it is from CorporateX by HRTechify;
- the user created a CorporateX account;
- the confirmation verifies the email address;
- future access uses email + password;
- contributor email is never displayed with a published workplace story.

## Future sign-in

CorporateX production uses `signInWithPassword`. Do not use Magic Link / `signInWithOtp` for normal My Space or story-submission access.

Password recovery uses Supabase's password-recovery email and returns the user to `reset-password.html` to choose a new password.

## Story-status emails

Submission receipts, HRTechify moderation alerts and publication-approved emails are separate transactional messages documented in `docs/STORY_NOTIFICATION_EMAILS.md`.
