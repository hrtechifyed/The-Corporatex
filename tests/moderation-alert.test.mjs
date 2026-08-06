import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const envExample = await read('.env.example');
const alertModule = await read('lib/moderation-alert.ts');
const submitRoute = await read('app/api/experiences/[id]/submit/route.ts');

test('moderator alert destination and standard subject are configured', () => {
  assert.match(envExample, /^MODERATION_ALERT_EMAIL=hrtechifyed@gmail\.com$/m);
  assert.match(envExample, /^MODERATION_ALERT_SUBJECT_PREFIX=\[CorporateX Safety Review\]$/m);
  assert.match(alertModule, /DEFAULT_SAFETY_REVIEW_SUBJECT_PREFIX = '\[CorporateX Safety Review\]'/);
  assert.match(alertModule, /Submission \$\{shortId\} requires review/);
});

test('email contains a protected review link but excludes story content', () => {
  assert.match(alertModule, /\/moderation\?experience=/);
  assert.match(alertModule, /story text and flagged expressions are intentionally excluded/i);
  assert.doesNotMatch(alertModule, /approved_summary|approved_headline|original_text|possibleAbusiveContent/);
});

test('only flagged submissions trigger a moderator alert', () => {
  assert.match(submitRoute, /possibleAbusiveContent/);
  assert.match(submitRoute, /safetyIndicators > 0/);
  assert.match(submitRoute, /sendSafetyReviewAlert/);
  assert.match(submitRoute, /status: 'not_required'/);
  assert.doesNotMatch(submitRoute, /sendSafetyReviewAlert\([\s\S]*approved_summary/);
});

test('email configuration is server-side and not exposed as public variables', () => {
  for (const variable of ['RESEND_API_KEY', 'MODERATION_FROM_EMAIL', 'MODERATION_ALERT_EMAIL', 'MODERATION_ALERT_SUBJECT_PREFIX']) {
    assert.match(envExample, new RegExp(`^${variable}=`, 'm'));
    assert.doesNotMatch(variable, /^NEXT_PUBLIC_/);
  }
});
