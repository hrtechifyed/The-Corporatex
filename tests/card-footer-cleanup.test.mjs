import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const privacy = await readFile('privacy-safety.html', 'utf8');
const how = await readFile('how-it-works.html', 'utf8');
const guided = await readFile('src/guided-production.js', 'utf8');
const css = await readFile('src/site-chrome-cleanup.css', 'utf8');
const footer = await readFile('src/site-footer.js', 'utf8');
const build = await readFile('scripts/build.mjs', 'utf8');

test('privacy cards keep the content but remove numbered and category decorations', () => {
  assert.doesNotMatch(privacy, /class="info-icon"/);
  assert.doesNotMatch(privacy, /data-tone="purple"/);
  for (const label of [
    'ACCOUNT &amp; MY SPACE',
    'SUBMISSIONS &amp; PUBLICATION',
    'EMAIL NOTIFICATIONS',
    'MODERATED FOLLOW-UP Q&amp;A',
    'SAFETY SCREEN ONLY',
    'YOUR CONTROLS &amp; POLICY SET',
  ]) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.doesNotMatch(privacy, new RegExp(`<p class="eyebrow">${escaped}<\\/p>`));
  }
  assert.match(privacy, /Questions and answers are moderated\./);
  assert.match(privacy, /Safety checks are narrow, not truth scoring\./);
});

test('How It Works cards no longer use numbered sequence labels', () => {
  for (const label of ['01 · SIGNAL', '02 · SEQUENCE', '03 · DECISION', 'ONE PERSPECTIVE', 'SAFETY + REVIEW', 'FINAL CONTROL']) {
    assert.doesNotMatch(how, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(how, /<p class="cx-how-kicker">Pass it forward<\/p>/i);
  assert.match(how, />Share Your Story →<\/a>/);
});

test('ending choice cards show names rather than ENDING 01-style labels', () => {
  assert.doesNotMatch(guided, /number:\s*'0[1-4]'/);
  assert.doesNotMatch(guided, /ENDING \$\{ending\.number\}/);
  for (const ending of ['Break Free', 'Next Act', 'Mixed Ending', 'Pass the Torch']) assert.match(guided, new RegExp(ending));
});

test('legacy color variants are overridden by one CorporateX card treatment', () => {
  assert.match(css, /\.policy-card\[data-tone="purple"\]/);
  assert.match(css, /\.cx-how-card/);
  assert.match(css, /\.cx-how-trust-card/);
  assert.match(css, /\.cx-how-forward__panel/);
  assert.match(css, /background:\s*linear-gradient\(160deg, #111214, #08090a 72%\)/);
  assert.match(css, /\.policy-card \.info-icon/);
  assert.match(css, /display:\s*none !important/);
});

test('footer has concise CorporateX branding, useful links and responsive safe-area layout', () => {
  assert.match(footer, /CorporateX/);
  assert.match(footer, /by HRTechify/);
  assert.match(footer, /Not a score\. A sequence\./);
  assert.match(footer, /Privacy & Safety/);
  assert.match(footer, /Terms/);
  assert.match(footer, /Community Guidelines/);
  assert.match(footer, /Contributor stories reflect individual perspectives\./);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /safe-area-inset-left/);
  assert.match(css, /safe-area-inset-right/);
});

test('production build injects the cleanup stylesheet and footer runtime everywhere', () => {
  assert.match(build, /src\/site-chrome-cleanup\.css/);
  assert.match(build, /src\/site-footer\.js/);
});
