import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const privacy = await readFile('privacy-safety.html', 'utf8');
const how = await readFile('how-it-works.html', 'utf8');
const guidedHtml = await readFile('guided-story.html', 'utf8');
const guided = await readFile('src/guided-production.js', 'utf8');
const css = await readFile('src/site-chrome-cleanup.css', 'utf8');
const footer = await readFile('src/site-footer.js', 'utf8');
const nextHome = await readFile('app/page.tsx', 'utf8');
const nextAbout = await readFile('app/about/page.tsx', 'utf8');
const nextMore = await readFile('app/more/page.tsx', 'utf8');
const nextCleanup = await readFile('app/card-footer-cleanup.css', 'utf8');
const nextFooter = await readFile('components/site-footer.tsx', 'utf8');
const pagesHome = await readFile('pages-preview/index.html', 'utf8');
const pagesCleanup = await readFile('pages-preview/card-footer-cleanup.css', 'utf8');
const syncHome = await readFile('scripts/sync-live-home.mjs', 'utf8');
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
  assert.match(privacy, /Save, unfollow, reset, withdraw, report\./);
  assert.match(privacy, /Private actions should be reversible where supported\./);
});

test('guided Story Beat cards remove large number badges, status captions and color variants', () => {
  assert.doesNotMatch(guidedHtml, /class="ref-card-icon"/);
  assert.doesNotMatch(guidedHtml, /class="ref-card-status"/);
  assert.doesNotMatch(guidedHtml, /ref-journey-card purple/);
  assert.doesNotMatch(guidedHtml, /ref-journey-card orange/);
  assert.doesNotMatch(guidedHtml, />SCENE 01</);
  for (const heading of ['The Beginning', 'The Shift', 'The Tipping Point', 'The Lesson', 'Who Thrives Here?']) {
    assert.match(guidedHtml, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('highlighted Story Beat cards always retain clear artwork', () => {
  assert.match(css, /\.ref-journey-card\.is-active \.ref-art-svg/);
  assert.match(css, /visibility:\s*visible !important/);
  assert.match(css, /\.ref-journey-card\[data-guided-chapter="beginning"\] \.ref-art-svg/);
  assert.match(css, /\.ref-journey-card\[data-guided-chapter="promise"\] \.ref-art-svg/);
  assert.match(css, /frozen-assets\/card-1\.webp/);
  assert.match(css, /frozen-assets\/card-5\.webp/);
});

test('How It Works cards no longer use numbered sequence labels', () => {
  for (const label of ['01 · SIGNAL', '02 · SEQUENCE', '03 · DECISION', 'ONE PERSPECTIVE', 'SAFETY + REVIEW', 'FINAL CONTROL']) {
    assert.doesNotMatch(how, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.doesNotMatch(nextMore, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(nextMore, /SAFETY ONLY/);
  assert.doesNotMatch(how, /<p class="cx-how-kicker">Pass it forward<\/p>/i);
  assert.match(how, />Share Your Story →<\/a>/);
});

test('ending choice cards show names rather than ENDING 01-style labels', () => {
  assert.doesNotMatch(guided, /number:\s*'0[1-4]'/);
  assert.doesNotMatch(guided, /ENDING \$\{ending\.number\}/);
  assert.doesNotMatch(nextHome, /Ending \{String\(index/);
  assert.doesNotMatch(pagesHome, />Ending 0[1-4]</);
  assert.match(nextHome, /<h3>\{ending\.title\}<\/h3>/);
  assert.match(nextHome, /<p>\{ending\.description\}<\/p>/);
  for (const ending of ['Break Free', 'Next Act', 'Mixed Ending', 'Pass the Torch']) {
    assert.match(guided, new RegExp(ending));
    assert.match(pagesHome, new RegExp(ending));
  }
});

test('homepage and About cards remove visible numbered/category storytelling labels', () => {
  for (const label of ['01 &middot; SIGNAL', '02 &middot; SEQUENCE', '03 &middot; DECISION', '01 &middot; EXPERIENCE', '03 &middot; SIGNAL', '04 &middot; DECISION']) {
    assert.doesNotMatch(pagesHome, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(nextAbout, /cx-about-card-label/);
  assert.doesNotMatch(nextAbout, /step\.number/);
  assert.doesNotMatch(nextAbout, /cx-about-swipe-hint/);
});

test('legacy color variants are overridden by one CorporateX card treatment', () => {
  assert.match(css, /\.policy-card\[data-tone="purple"\]/);
  assert.match(css, /\.cx-how-card/);
  assert.match(css, /\.cx-how-trust-card/);
  assert.match(css, /\.cx-how-forward__panel/);
  assert.match(css, /\.ref-journey-card\.purple/);
  assert.match(css, /background:\s*linear-gradient\(160deg, #111214, #08090a 72%\)/);
  assert.match(css, /\.ref-journey-card \.ref-card-icon/);
  assert.match(css, /display:\s*none !important/);
  assert.match(nextCleanup, /--ending-accent:\s*#f6c84f !important/);
  assert.match(nextCleanup, /\.cx-about-deck-card/);
  assert.match(pagesCleanup, /\.pages-ending-grid \.pages-ending-card\[data-ending\]/);
  assert.match(pagesCleanup, /background:\s*linear-gradient\(160deg, #111214, #08090a 72%\)/);
});

test('My Space and secure access use a sharper large hero source', () => {
  assert.match(css, /\.cx-auth-visual/);
  assert.match(css, /frozen-assets\/hero\.webp/);
  assert.match(css, /\.cx-auth-visual > img/);
});

test('footers use concise CorporateX copy and responsive safe-area layouts', () => {
  for (const source of [footer, nextFooter, pagesHome]) {
    assert.match(source, /Workplace stories, structured for better career decisions\./);
    assert.match(source, /Contributor stories reflect individual perspectives and are moderated before publication\./);
  }
  assert.match(footer, /Stories/);
  assert.match(footer, /Privacy & Safety/);
  assert.match(footer, /Terms/);
  assert.match(nextFooter, /Community Guidelines/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /safe-area-inset-left/);
  assert.match(css, /safe-area-inset-right/);
  assert.match(nextCleanup, /safe-area-inset-bottom/);
  assert.match(pagesCleanup, /safe-area-inset-bottom/);
});

test('production builds load both cleanup layers', () => {
  assert.match(build, /src\/site-chrome-cleanup\.css/);
  assert.match(build, /src\/site-footer\.js/);
  assert.match(syncHome, /card-footer-cleanup\.css/);
});
