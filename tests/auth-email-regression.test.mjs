import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');

const authEmail = await read('lib/auth-email.ts');
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
  assert.match(authEmail, /Thank you for sharing your story — one last step/);
  assert.match(authEmail, /Your CorporateX sign-in link/);
  assert.match(authEmail, /auth\.admin\.generateLink/);
  assert.match(authEmail, /hashed_token/);
  assert.match(authEmail, /new URL\('\/auth\/confirm'/);
});

test('submission verification email thanks contributors and makes the privacy/review promise explicit', () => {
  assert.match(authEmail, /Thank you for trusting us with your story\./);
  assert.match(authEmail, /That experience matters\./);
  assert.match(authEmail, /Your perspective can help someone else ask a better question/);
  assert.match(authEmail, /Verify my email & submit my story/);
  assert.match(authEmail, /It will not be published automatically\./);
  assert.match(authEmail, /It will never appear on the public story\./);
  assert.match(authEmail, /You were there\. Your experience counts\. And your story deserves more than a rating\./);
  assert.match(authEmail, /People · Technology · Growth/);
});

test('verification links no longer depend on a localhost or Supabase email redirect', () => {
  assert.match(submitVerifyAction, /sendCorporateXAuthEmail/);
  assert.match(submitVerifyAction, /getSiteOrigin/);
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
