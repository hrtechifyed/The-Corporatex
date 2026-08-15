import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const journey = await readFile('src/exit-journey-signal.css', 'utf8');
const storyCard = await readFile('src/home-published-card.css', 'utf8');
const build = await readFile('scripts/build.mjs', 'utf8');

test('header signal communicates a readable exit journey on desktop and mobile', () => {
  for (const label of ["content: 'JOIN'", "content: 'SHIFT'", "content: 'EXIT'", "content: 'NEXT →'"]) {
    assert.match(journey, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(journey, /@media \(max-width: 920px\)/);
  assert.match(journey, /display:\s*block !important/);
  assert.match(journey, /pointer-events:\s*none/);
  assert.match(journey, /@media \(prefers-reduced-motion: reduce\)/);
  for (const unrelated of ['pages-story-card', 'cx-home-published', 'policy-card', 'ref-journey-card', 'story-row']) {
    assert.doesNotMatch(journey, new RegExp(unrelated));
  }
});

test('live homepage story preview has an isolated editorial thumbnail and branded controls', () => {
  assert.match(storyCard, /\.cx-home-published\s*\{/);
  assert.match(storyCard, /\.cx-home-published::before/);
  assert.match(storyCard, /frozen-assets\/card-1\.webp/);
  assert.match(storyCard, /frozen-assets\/card-3\.webp/);
  assert.match(storyCard, /frozen-assets\/card-5\.webp/);
  assert.match(storyCard, /\.cx-home-published \.cx-home-story-link/);
  assert.match(storyCard, /text-decoration:\s*none !important/);
  assert.match(storyCard, /\.cx-home-published \.cx-story-action/);
  assert.match(storyCard, /\.cx-home-published \.pages-story-copy h2/);
  assert.match(storyCard, /-webkit-line-clamp:\s*3/);
  assert.match(storyCard, /@media \(max-width: 620px\)/);
  assert.match(storyCard, /\.cx-home-published \.pages-story-copy > p[\s\S]*display:\s*none !important/);
});

test('published story polish loads after shared card palette and before nav journey', () => {
  assert.match(build, /src\/home-published-card\.css/);
  const gold = build.indexOf('src/card-gold-accent.css');
  const published = build.indexOf('src/home-published-card.css');
  const journeyIndex = build.indexOf('src/exit-journey-signal.css');
  assert.ok(gold >= 0 && published > gold && journeyIndex > published);
});
