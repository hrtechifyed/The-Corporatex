import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const journey = await readFile('src/exit-journey-signal.css', 'utf8');
const storyCard = await readFile('src/home-published-card.css', 'utf8');
const storyArchiveArt = await readFile('src/stories-live-art.css', 'utf8');
const storyPolish = await readFile('src/stories-polish.js', 'utf8');
const build = await readFile('scripts/build.mjs', 'utf8');

test('header signal explains four distinct workplace journey stages and owns a mobile strip', () => {
  for (const label of ["content: 'JOINED'", "content: 'WHAT CHANGED'", "content: 'THE DECISION'", "content: 'WHAT’S NEXT →'"]) {
    assert.match(journey, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(journey, /content:\s*'SHIFT'/);
  assert.doesNotMatch(journey, /content:\s*'WHY IT ENDED'/);
  assert.match(journey, /cx-exit-next-label 8\.8s/);
  assert.match(journey, /transform:\s*translateX\(-50%\) scale\(1\.19\)/);
  assert.match(journey, /83%, 91%/);
  assert.match(journey, /@media \(max-width: 920px\)/);
  assert.match(journey, /height:\s*calc\(var\(--cx-shell-header-mobile\) \+ 38px\)/);
  assert.match(journey, /\.cx-unified-header__inner[\s\S]*height:\s*var\(--cx-shell-header-mobile\)/);
  assert.match(journey, /bottom:\s*0/);
  assert.match(journey, /pointer-events:\s*none/);
  assert.match(journey, /@media \(prefers-reduced-motion: reduce\)/);
  for (const unrelated of ['pages-story-card', 'cx-home-published', 'policy-card', 'ref-journey-card', 'story-row']) {
    assert.doesNotMatch(journey, new RegExp(unrelated));
  }
});

test('legacy public story markup is hidden until live data is ready', () => {
  assert.match(storyArchiveArt, /body\[data-page='stories'\]:not\(\.cx-stories-ready\) \.company-list > \*/);
  assert.match(storyArchiveArt, /Loading published stories/);
  assert.match(storyArchiveArt, /not\(\.cx-story-detail-ready\) \.story-article > \*/);
  assert.match(storyArchiveArt, /Loading story/);
  assert.match(storyPolish, /MutationObserver/);
  assert.match(storyPolish, /cx-stories-ready/);
  assert.match(storyPolish, /cx-story-detail-ready/);
});

test('public story detail removes moderation-only approval language and stale demo sidebar', () => {
  assert.match(storyPolish, /What the contributor approved for publication/);
  assert.match(storyPolish, /section\.remove\(\)/);
  assert.match(storyPolish, /Published contributor perspective/);
  assert.match(storyPolish, /chip\.textContent = 'Workplace story'/);
  assert.match(storyPolish, /replaceDetailSidebar/);
  assert.match(storyPolish, /One perspective/);
  assert.match(storyPolish, /Use it forward/);
  assert.match(storyArchiveArt, /\.cx-public-story-side/);
});

test('homepage keeps one published-story archive and uses the hero for a reading guide instead', () => {
  assert.match(storyPolish, /pages-archive cx-home-story-guide/);
  assert.match(storyPolish, /HOW TO READ A STORY/);
  assert.match(storyPolish, /Follow the sequence, not just the ending/);
  assert.match(storyPolish, /guide\.replaceChildren\(card\)/);
  assert.match(storyArchiveArt, /\.pages-archive\.cx-home-story-guide/);
  assert.match(storyArchiveArt, /\.cx-home-story-guide__card/);
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

test('published Stories cards match the homepage image-led black and gold card language', () => {
  assert.match(storyArchiveArt, /\.cx-story-shell\s*\{/);
  assert.match(storyArchiveArt, /grid-template-rows:\s*190px 1fr auto/);
  assert.match(storyArchiveArt, /content:\s*'WORKPLACE STORY'/);
  assert.match(storyArchiveArt, /content:\s*'Read story'/);
  assert.match(storyArchiveArt, /\.cx-story-shell \.cx-story-actions/);
  assert.match(storyArchiveArt, /frozen-assets\/card-1\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/card-2\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/card-3\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/card-4\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/card-5\.webp/);
  assert.match(storyArchiveArt, /frozen-assets\/hero\.webp/);
  assert.match(storyArchiveArt, /@media \(max-width: 760px\)/);
  assert.match(storyArchiveArt, /width:\s*100%/);
  assert.match(storyArchiveArt, /height:\s*clamp\(174px, 44vw, 214px\)/);
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
