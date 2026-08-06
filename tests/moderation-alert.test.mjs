import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const envExample = await read('.env.example');
const alertModule = await read('lib/moderation-alert.ts');
const submitRoute = await read('app/api/experiences/[id]/submit/route.ts');
const packageJson = JSON.parse(await read('package.json'));

test('moderator alert destination and standard subject are configured', () => {
  assert.match(envExample, /^GMAIL_USER=hrtechifyed@gmail\.com$/m);
  assert.match(envExample, /^MODERATION_ALERT_EMAIL=hrtechifyed@gmail\.com$/m);
  assert.match(envExample, /^MODERATION_ALERT_SUBJECT_PREFIX=\[CorporateX Safety Review\]$/m);
  assert.match(alertModule, /DEFAULT_SAFETY_REVIEW_SUBJECT_PREFIX = '\[CorporateX Safety Review\]'/);
  assert.match(alertModule, /Submission \$\{shortId\} requires review/);
});

test('CorporateX uses the same Gmail API OAuth transport as GrowWithHR Version 2', () => {
  assert.equal(packageJson.dependencies.googleapis, '^173.0.0');
  assert.match(alertModule, /import \{ google \} from 'googleapis'/);
  assert.match(alertModule, /new google\.auth\.OAuth2\(clientId, clientSecret\)/);
  assert.match(alertModule, /refresh_token: refreshToken/);
  assert.match(alertModule, /google\.gmail\(\{ version: 'v1', auth: oauth2Client \}\)/);
  assert.match(alertModule, /gmailApi\.users\.messages\.send/);
  assert.match(alertModule, /userId: 'me'/);
  assert.match(alertModule, /requestBody: \{ raw \}/);
  assert.match(alertModule, /Content-Type: multipart\/alternative/);
  assert.match(alertModule, /encodeBase64Url/);
  assert.doesNotMatch(alertModule, /api\.resend\.com|RESEND_API_KEY|MODERATION_FROM_EMAIL/);
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

test('Gmail credentials are server-side and follow the GrowWithHR environment contract', () => {
  for (const variable of [
    'GMAIL_USER',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'MODERATION_ALERT_EMAIL',
    'MODERATION_ALERT_SUBJECT_PREFIX',
  ]) {
    assert.match(envExample, new RegExp(`^${variable}=`, 'm'));
    assert.doesNotMatch(variable, /^NEXT_PUBLIC_/);
  }

  assert.doesNotMatch(envExample, /RESEND_API_KEY|MODERATION_FROM_EMAIL/);
});
