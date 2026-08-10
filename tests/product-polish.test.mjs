import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');

const [
  header,
  footer,
  about,
  css,
  locationRoute,
  scene,
  scenePage,
  liveCloud,
  finalize,
  home,
  complete,
  layout,
] = await Promise.all([
  read('components/site-header.tsx'),
  read('components/site-footer.tsx'),
  read('app/about/page.tsx'),
  read('app/product-polish.css'),
  read('app/api/location/validate/route.ts'),
  read('components/validated-scene-step.tsx'),
  read('app/submit/scene/page.tsx'),
  read('components/live-signal-cloud.tsx'),
  read('app/api/submission/finalize/route.ts'),
  read('app/page.tsx'),
  read('app/submit/complete/page.tsx'),
  read('app/layout.tsx'),
]);

test('primary navigation is animated and About has its own route', () => {
  assert.match(header, /\['About', '\/about'\]/);
  assert.match(header, /cx-brand-orbit/);
  assert.match(header, /cx-header-signal/);
  assert.match(css, /\.site-header \.cx-primary-nav/);
  assert.match(css, /cx-header-signal/);
  assert.match(css, /cx-brand-orbit/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('About is a one-screen animated narrative on desktop with a mobile usability fallback', () => {
  assert.match(about, /Workplace truth has a <em>timeline\.<\/em>/);
  assert.match(about, /Experience/);
  assert.match(about, /Sequence/);
  assert.match(about, /Signal/);
  assert.match(about, /Decision/);
  assert.match(css, /\.cx-about-page\s*\{[^}]*height:\s*calc\(100svh - 82px\)/s);
  assert.match(css, /body:has\(\.cx-about-page\)\s*\{\s*overflow:\s*hidden/);
  assert.match(css, /cx-about-thread/);
  assert.match(css, /cx-about-breathe/);
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*body:has\(\.cx-about-page\)\s*\{\s*overflow:auto/);
});

test('footer legal copy is exactly two centered lines', () => {
  assert.match(footer, /CorporateX — Powered by HRTechify · People · Technology · Growth/);
  assert.match(footer, /© 2026 All Rights Reserved\. Stories are contributor perspectives/);
  assert.match(css, /\.cx-footer-bottom[\s\S]*flex-direction:\s*column/);
  assert.match(css, /\.cx-footer-bottom[\s\S]*text-align:\s*center/);
});

test('Set the Scene verifies a broad location as a real place before Story Beats', () => {
  assert.match(scenePage, /ValidatedSceneStep/);
  assert.match(scene, /async function next\(\)[\s\S]*\/api\/location\/validate\?q=/);
  assert.match(scene, /Checking that this is a real place/);
  assert.match(scene, /Verified place:/);
  assert.match(scene, /Remote work is captured separately/);
  assert.match(scene, /OpenStreetMap contributors/);
  assert.match(locationRoute, /nominatim\.openstreetmap\.org\/search/);
  assert.match(locationRoute, /User-Agent/);
  assert.match(locationRoute, /1050/);
  assert.match(locationRoute, /revalidate:\s*86400/);
  assert.doesNotMatch(scene, /useEffect\([^)]*location\/validate/s, 'place verification must not be an autocomplete effect');
});

test('incoming word cloud exposes only predefined safe labels while stories stay private', () => {
  assert.match(home, /LiveSignalCloud/);
  assert.match(liveCloud, /SAFE_LIVE_LABELS/);
  assert.match(liveCloud, /published_experiences/);
  assert.match(liveCloud, /pending_moderation/);
  assert.match(liveCloud, /Live · pending content validation/);
  assert.match(liveCloud, /not that the contributor’s story has been published/);
  assert.match(liveCloud, /underlying story, company details and contributor identity remain private/);
  assert.doesNotMatch(liveCloud, /original_text|guided_answers|approved_summary/);
  assert.match(finalize, /const liveLabels = Array\.from\(new Set/);
  assert.match(finalize, /input\.ending/);
  assert.match(finalize, /input\.shiftTopics/);
  assert.match(finalize, /liveLabels\.map/);
  assert.match(finalize, /status: 'pending_moderation', liveLabels/);
  assert.match(complete, /Your signal is live\. Your story is still private\./);
  assert.match(complete, /pending content validation/);
});

test('the product polish stylesheet loads after the frozen global system', () => {
  const frozenIndex = layout.indexOf("./frozen-global.css");
  const polishIndex = layout.indexOf("./product-polish.css");
  assert.ok(frozenIndex >= 0 && polishIndex > frozenIndex);
});
