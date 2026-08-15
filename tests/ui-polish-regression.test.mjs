import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const journey = await readFile('src/exit-journey-signal.css', 'utf8');
const storyCard = await readFile('src/home-published-card.css', 'utf8');
const storyArchiveArt = await readFile('src/stories-live-art.css', 'utf8');
const build = await readFile('scripts/build.mjs', 'utf8');

test('header signal explains the workplace journey in plain language and owns a mobile strip', () => {
  for (const label of ["content: 'JOINED'", "content: 'WORK CHANGED'", "content: 'LEFT'", "content: 'NEXT CHAPTER →'"]) {
    assert.match(journey, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(journey, /content:\s*'SHIFT'/);
  assert.match(journey, /@media \(max-width: 920px\)/);
  assert.match(journey, /height:\s*calc\(var\(--cx-shell-header-mobile\) \+ 34px\)/);
  assert.match(journey, /\.cx-unified-header__inner[\s\S]*height:\s*var\(--cx-shell-header-mobile\)/);
  assert.match(journey, /bottom:\s*0/);
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

test('published Stories cards use cinematic artwork instead of the sparkle placeholder', () => {
  assert.match(storyArchiveArt, /\.cx-story-shell \.story-row \.story-thumb/);
  assert.match(storyArchiveArt, /font-size:\s*0/);
  assert.match(storyArchiveArt, /frozen-assets\/card-1\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/card-2\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/card-3\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/card-4\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/card-5\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/hero\.webp/);
  assert.match(storyArchiveArt, /@media \(max-width: 620px\)/);
  assert.match(storyArchiveArt, /grid-template-columns:\s*1fr !important/);
  assert.match(storyArchiveArt, /width:\s*100%/);
  assert.match(storyArchiveArt, /height:\s*clamp\(138px, 42vw, 176px\)/);
});

test('story artwork and homepage polish load after shared palette and before nav journey', () => {
  assert.match(build, /src\/stories-live-art\.css/);
  assert.match(build, /src\/home-published-card\.css/);
  const gold = build.indexOf('src/card-gold-accent.css');
  const archiveArt = build.indexOf('src/stories-live-art.css');
  const published = build.indexOf('src/home-published-card.css');
  const journeyIndex = build.indexOf('src/exit-journey-signal.css');
  assert.ok(gold >= 0 && archiveArt > gold && published > archiveArt && journeyIndex > published);
});
