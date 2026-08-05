import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const htmlFiles = (await readdir('.')).filter((file) => file.endsWith('.html')).sort();
const upgradeSource = await read('src/site-upgrades.js');
const appSource = await read('src/app-v2.js');

assert.match(appSource, /import\('\.\/site-upgrades\.js'\)/, 'app-v2.js must load the quality module');
assert.match(upgradeSource, /Exit stories\. Smarter decisions\./, 'prototype brand language must not imply genuine published stories');
assert.match(upgradeSource, /THEMES WORKPLACE EXITS CAN REVEAL/, 'the theme cloud must use non-data-backed prototype language');
assert.match(upgradeSource, /sections\.slice\(1\).*remove/s, 'Share Your Story must remove preview sections after the format choice');

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

for (const file of htmlFiles) {
  const html = await read(file);
  const positions = expectedNavOrder.map((label) => html.indexOf(`>${label}<`));
  assert.ok(positions.every((position) => position >= 0), `${file}: shared navigation labels must exist`);
  assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]), `${file}: navigation order must remain consistent`);
  assert.ok(html.includes(footerLine1), `${file}: footer line one is missing`);
  assert.ok(html.includes(footerLine2), `${file}: footer line two is missing`);
}

for (const file of ['guided-story.html', 'freeflow-story.html']) {
  const html = await read(file);
  assert.equal((html.match(/data-confirm/g) || []).length, 1, `${file}: exactly one final agreement checkbox is required`);
}

console.log(`Site quality checks passed for ${htmlFiles.length} public pages.`);
