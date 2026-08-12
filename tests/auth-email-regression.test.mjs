import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');

const authEmail = await read('lib/auth-email.ts');
const submissionAuthEmail = await read('lib/submission-auth-email.ts');
const submissionHandoff = await read('lib/submission-handoff.ts');
const siteOrigin = await read('lib/site-origin.ts');
const submitVerifyAction = await read('app/submit/verify/actions.ts');
const loginAction = await read('app/login/actions.ts');
const confirmRoute = await read('app/auth/confirm/route.ts');
const storyNavigationCss = await read('app/story-beat-navigation.css');
const rootLayout = await read('app/layout.tsx');

test('user auth emails are sent through the HRTechify Gmail transport with CorporateX subjects', () => {
  assert.match(authEmail, /GMAIL_USER/);
  assert.match(authEmail, /google\.gmail\(\{ version: 'v1'/);
  assert.match(authEmail, /HRTechify · CorporateX/);
  assert.match(authEmail, /Your CorporateX sign-in link/);
  assert.match(authEmail, /auth\.admin\.generateLink/);
  assert.match(authEmail, /hashed_token/);
  assert.match(authEmail, /new URL\('\/auth\/confirm'/);

  assert.match(submissionAuthEmail, /GMAIL_USER/);
  assert.match(submissionAuthEmail, /google\.gmail\(\{ version: 'v1'/);
  assert.match(submissionAuthEmail, /Thank you for sharing your story — one last step/);
  assert.match(submissionAuthEmail, /auth\.admin\.generateLink/);
  assert.match(submissionAuthEmail, /hashed_token/);
});

test('submission verification email creates a private recoverable handoff before email delivery', () => {
  assert.match(submissionAuthEmail, /prepareSubmissionHandoff/);
  assert.match(submissionAuthEmail, /another browser or device/);
  assert.match(submissionAuthEmail, /not public/);
  assert.match(submissionAuthEmail, /not entered moderation/);
  assert.match(submissionAuthEmail, /\/submit\/finish\?id=/);
  assert.match(submissionHandoff, /status: 'draft'/);
  assert.match(submissionHandoff, /guided_answers/);
});

test('verification links no longer depend on localhost, Supabase redirect configuration or same-browser localStorage', () => {
  assert.match(submitVerifyAction, /sendRecoverableSubmissionLink/);
  assert.match(submitVerifyAction, /getSiteOrigin/);
  assert.match(submitVerifyAction, /draftPayload/);
  assert.doesNotMatch(submitVerifyAction, /signInWithOtp|emailRedirectTo|localhost:3000/);
  assert.match(loginAction, /sendCorporateXAuthEmail/);
  assert.doesNotMatch(loginAction, /signInWithOtp|emailRedirectTo|localhost:3000/);
  assert.match(siteOrigin, /x-forwarded-host/);
  assert.match(siteOrigin, /NEXT_PUBLIC_SITE_URL/);
});

test('CorporateX confirms the token hash on its own host and preserves only safe next paths', () => {
  assert.match(confirmRoute, /verifyOtp/);
  assert.match(confirmRoute, /token_hash: tokenHash/);
  assert.match(confirmRoute, /value\.startsWith\('\/'\)/);
  assert.match(confirmRoute, /value\.startsWith\('\/\/'\)/);
  assert.match(confirmRoute, /\/submit\/verify/);
});

test('Story Beat navigation is visually ordered above the writing field', () => {
  assert.match(rootLayout, /story-beat-navigation\.css/);
  assert.match(storyNavigationCss, /cx-flow-card--story > \.cx-flow-actions/);
  assert.match(storyNavigationCss, /order:\s*4/);
  assert.match(storyNavigationCss, /cx-flow-writing-field[^{]*\{\s*order:\s*5/);
  assert.match(storyNavigationCss, /justify-content:\s*flex-end/);
});
