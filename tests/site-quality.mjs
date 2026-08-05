import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const htmlFiles = (await readdir('.')).filter((file) => file.endsWith('.html')).sort();
const upgradeSource = await read('src/site-upgrades.js');
const disclosureSource = await read('src/progressive-disclosure.js');
const trustSource = await read('src/trust-guardrails.js');
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

const expectedNavOrder = ['Home', 'Share Your Story', 'Stories', 'More', 'Privacy &amp; Safety'];
const footerLine1 = 'The Corporate Ex - Powered by - HRTechify - People • Technology • Growth';
const footerLine2 = '© 2026 All Rights Reserved.';
const unsupportedTrustLabel = /Verified Employee|Verified Ex-Employee|Confirmed Account/i;

for (const file of htmlFiles) {
  const html = await read(file);
  const positions = expectedNavOrder.map((label) => html.indexOf(`>${label}<`));
  assert.ok(positions.every((position) => position >= 0), `${file}: shared navigation labels must exist`);
  assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]), `${file}: navigation order must remain consistent`);
  assert.ok(html.includes(footerLine1), `${file}: footer line one is missing`);
  assert.ok(html.includes(footerLine2), `${file}: footer line two is missing`);
  assert.doesNotMatch(html, unsupportedTrustLabel, `${file}: unsupported trust label found`);
}

for (const file of ['guided-story.html', 'freeflow-story.html']) {
  const html = await read(file);
  assert.equal((html.match(/data-confirm/g) || []).length, 1, `${file}: exactly one final agreement checkbox is required`);
}

console.log(`Site quality checks passed for ${htmlFiles.length} public pages.`);
