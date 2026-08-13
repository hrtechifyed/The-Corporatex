import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const [privacy, terms, community, stagingPrivacy] = await Promise.all([
  read('privacy-safety.html'),
  read('terms.html'),
  read('community-guidelines.html'),
  read('app/privacy/page.tsx'),
]);

test('privacy page matches the live My Space data model', () => {
  for (const phrase of [
    'Saved and Following are private',
    'Questions and answers are moderated',
    'Your email is for private access',
    'GitHub Pages serves the public CorporateX frontend',
    'Supabase provides authentication, database storage and trusted backend functions',
    'does not currently publish an automatic retention period',
    'account-data review, correction, removal or withdrawal',
  ]) assert.match(privacy, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

  assert.doesNotMatch(privacy, /prototype keeps writing only on the open page/i);
  assert.doesNotMatch(privacy, /A production database will/i);
  assert.match(privacy, /community-guidelines\.html/);
  assert.match(privacy, /terms\.html/);
});

test('terms cover private account actions and moderated conversations', () => {
  assert.match(terms, /Saved &amp; Following/);
  assert.match(terms, /Questions are moderated before publication|questions and contributor responses also require moderation/i);
  assert.match(terms, /No harassment, doxxing or identity fishing/i);
  assert.match(terms, /privacy-safety\.html/);
});

test('community rules prohibit identity hunting and pile-ons in follow-up Q&A', () => {
  assert.match(community, /Ask for context, not identity/i);
  assert.match(community, /Questions are moderated before publication/i);
  assert.match(community, /No pile-ons or targeting/i);
  assert.match(community, /Saved and Following are private product tools, not public popularity signals/i);
});

test('staging privacy copy stays aligned with the GitHub production model', () => {
  assert.match(stagingPrivacy, /Saved and Following/);
  assert.match(stagingPrivacy, /moderated follow-up Q&amp;A/i);
  assert.match(stagingPrivacy, /GitHub Pages is the normal user-facing frontend/i);
  assert.match(stagingPrivacy, /Supabase provides authentication, database storage and trusted backend functions/i);
  assert.doesNotMatch(stagingPrivacy, /unfinished contribution stays in your browser while you write/i);
});
