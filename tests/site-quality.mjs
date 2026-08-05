import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const htmlFiles = (await readdir('.')).filter((file) => file.endsWith('.html')).sort();
const upgradeSource = await read('src/site-upgrades.js');
const disclosureSource = await read('src/progressive-disclosure.js');
const trustSource = await read('src/trust-guardrails.js');
const visualSource = await read('src/visual-polish.js');
const visualCss = await read('src/visual-polish.css');
const accessibilitySource = await read('src/accessibility-polish.js');
const betaSource = await read('src/beta-content.js');
const appSource = await read('src/app-v2.js');
const storiesSource = await read('stories.html');

assert.match(appSource, /import\('\.\/site-upgrades\.js'\)/, 'app-v2.js must load the quality module');
assert.match(upgradeSource, /Exit stories\. Smarter decisions\./, 'prototype brand language must not imply genuine published stories');
assert.match(upgradeSource, /THEMES WORKPLACE EXITS CAN REVEAL/, 'the theme cloud must use non-data-backed prototype language');
assert.match(upgradeSource, /sections\.slice\(1\).*remove/s, 'Share Your Story must remove preview sections after the format choice');
assert.match(upgradeSource, /progressive-disclosure\.js/, 'the progressive disclosure module must load');

assert.match(disclosureSource, /makeDisclosureCard/, 'More and Privacy cards must support expandable detail');
assert.match(disclosureSource, /form\.insertBefore\(writingSection, themeSection\)/, 'Free-flow writing must appear before optional themes');
assert.match(disclosureSource, /optional-theme-disclosure/, 'Free-flow themes must be collapsed by default');
assert.match(disclosureSource, /chapter-button span/, 'Guided helper copy must be hidden until the active editor');
assert.match(disclosureSource, /trust-guardrails\.js/, 'trust guardrails must load after disclosure enhancements');

assert.match(trustSource, /allowedTrustLabels/, 'public trust labels must be allow-listed');
assert.match(trustSource, /forbiddenVerificationPattern/, 'unsupported verification labels must be blocked');
assert.match(trustSource, /candidate-takeaway/, 'the candidate question must receive visual priority');
assert.match(trustSource, /visual-polish\.js/, 'visual polish must load after trust guardrails');

assert.match(visualSource, /setAttribute\('width', '50'\)/, 'logo width must be explicit');
assert.match(visualSource, /setAttribute\('height', '50'\)/, 'logo height must be explicit');
assert.match(visualSource, /loading', 'lazy'/, 'below-the-fold images must be lazy loaded');
assert.match(visualSource, /accessibility-polish\.js/, 'accessibility enhancements must load after visual polish');
assert.match(accessibilitySource, /aria-pressed/, 'interactive selection state must be exposed');
assert.match(accessibilitySource, /aria-describedby/, 'form helper text must be associated with controls');
assert.match(accessibilitySource, /beta-content\.js/, 'the controlled beta data layer must load last');
assert.match(betaSource, /published-stories\.json/, 'published story data must drive the beta directory');
assert.match(betaSource, /textContent/, 'contributor content must use safe text assignment');

assert.match(visualCss, /--type-hero:/, 'a shared hero type scale is required');
assert.match(visualCss, /--type-page:/, 'a shared page-title scale is required');
assert.match(visualCss, /word-cloud a\{animation:none\}/, 'individual cloud words must not all animate continuously');
assert.match(visualCss, /animation:story-breathe 16s/, 'story-card motion must be slow paced');
assert.match(visualCss, /prefers-reduced-motion:reduce/, 'the visual system must respect reduced motion');
assert.doesNotMatch(visualCss, /brand-logo[^}]*filter:blur/s, 'the brand logo must never be blurred');

assert.doesNotMatch(storiesSource, /Sony|NVIDIA/i, 'fictional demonstrations must not use real employer names');
assert.doesNotMatch(storiesSource, /Illustrative preview/i, 'demonstration status should be stated once, not repeated on every row');
for (const fictionalEmployer of ['Northstar Technologies', 'Atlas Systems', 'Meridian Group']) {
  assert.ok(storiesSource.includes(fictionalEmployer), `stories.html must include fictional employer ${fictionalEmployer}`);
}
assert.equal((storiesSource.match(/Demonstration content:/g) || []).length, 1, 'the directory must use one demonstration banner');

const budgets = Object.fromEntries(
  [...upgradeSource.matchAll(/\s+(home|share|guided|freeflow|stories|more|privacy|storyDetailPlatformCopy):\s*(\d+)/g)]
    .map((match) => [match[1], Number(match[2])]),
);
assert.deepEqual(budgets, {
  home: 180,
  share: 90,
  guided: 140,
  freeflow: 120,
  stories: 80,
  more: 140,
  privacy: 160,
  storyDetailPlatformCopy: 80,
});

const expectedPrimaryNavHrefs = ['index.html', 'share-story.html', 'stories.html', 'more-info.html', 'privacy-safety.html'];
const footerLine1 = 'The Corporate Ex - Powered by - HRTechify - People • Technology • Growth';
const footerLine2 = '© 2026 All Rights Reserved.';
const unsupportedTrustLabel = /Verified Employee|Verified Ex-Employee|Confirmed Account/i;

for (const file of htmlFiles) {
  const html = await read(file);
  const primaryNav = html.match(/<nav class="primary-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  const positions = expectedPrimaryNavHrefs.map((href) => primaryNav.indexOf(`href="${href}"`));
  assert.ok(positions.every((position) => position >= 0), `${file}: shared primary navigation links must exist`);
  assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]), `${file}: primary navigation order must remain consistent`);
  assert.ok(html.includes(footerLine1), `${file}: footer line one is missing`);
  assert.ok(html.includes(footerLine2), `${file}: footer line two is missing`);
  assert.doesNotMatch(html, unsupportedTrustLabel, `${file}: unsupported trust label found`);
}

for (const file of ['guided-story.html', 'freeflow-story.html']) {
  const html = await read(file);
  assert.equal((html.match(/data-confirm/g) || []).length, 1, `${file}: exactly one final agreement checkbox is required`);
}

console.log(`Site quality checks passed for ${htmlFiles.length} public pages.`);
