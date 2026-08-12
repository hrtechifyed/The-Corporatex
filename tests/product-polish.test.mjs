import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');

const [
  header,
  footer,
  about,
  css,
  refinement,
  locationRoute,
  scene,
  scenePage,
  liveCloud,
  finalize,
  home,
  complete,
  layout,
  pagesPreview,
  pagesCss,
  staticBuild,
] = await Promise.all([
  read('components/site-header.tsx'),
  read('components/site-footer.tsx'),
  read('app/about/page.tsx'),
  read('app/product-polish.css'),
  read('app/interface-refinement.css'),
  read('app/api/location/validate/route.ts'),
  read('components/validated-scene-step.tsx'),
  read('app/submit/scene/page.tsx'),
  read('components/live-signal-cloud.tsx'),
  read('app/api/submission/finalize/route.ts'),
  read('app/page.tsx'),
  read('app/submit/complete/page.tsx'),
  read('app/layout.tsx'),
  read('pages-preview/index.html'),
  read('pages-preview/github-pages-current.css'),
  read('scripts/build.mjs'),
]);

test('primary navigation is animated, includes Home and About has its own route', () => {
  assert.match(header, /\['Home', '\/'\]/);
  assert.match(header, /\['About', '\/about'\]/);
  assert.match(header, /cx-brand-orbit/);
  assert.match(header, /cx-header-signal/);
  assert.match(css, /\.site-header \.cx-primary-nav/);
  assert.match(css, /cx-header-signal/);
  assert.match(css, /cx-brand-orbit/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('account utility stays secondary and becomes My Stories for an authenticated session', () => {
  assert.match(header, /createBrowserClient/);
  assert.match(header, /supabase\.auth\.getSession\(\)/);
  assert.match(header, /onAuthStateChange/);
  assert.match(header, /signedIn \? '\/account' : '\/login'/);
  assert.match(header, /signedIn \? 'My Stories' : 'Sign In'/);
  assert.match(header, /'cx-sign-in'/);
});

test('GitHub Pages overlays the current homepage preview and materializes the frozen artwork', () => {
  assert.match(pagesPreview, /Not a score\./);
  assert.match(pagesPreview, /A <em>sequence\.<\/em>/);
  assert.match(pagesPreview, /HRTechify/);
  assert.match(pagesPreview, />Sign In</);
  assert.match(pagesPreview, /https:\/\/corporatex\.onrender\.com\/login/);
  assert.match(pagesCss, /frozen-assets\/hero\.webp/);
  assert.match(pagesCss, /frozen-assets\/card-1\.webp/);
  assert.match(pagesCss, /frozen-assets\/card-5\.webp/);
  assert.match(pagesPreview, /CorporateX — Powered by HRTechify · People · Technology · Growth/);
  assert.match(staticBuild, /pages-preview\/index\.html/);
  assert.match(staticBuild, /frozenOutputDir = 'dist\/frozen-assets'/);
  assert.match(staticBuild, /\$\{frozenOutputDir\}\/hero\.webp/);
  assert.match(staticBuild, /readFrozenChunk/);
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

test('About deck is parallel and straight rather than a crooked fan', () => {
  assert.match(refinement, /data-depth="0"[\s\S]*translate\(-58%, -50%\)/);
  assert.match(refinement, /data-depth="1"[\s\S]*translate\(-51%, -50%\)/);
  assert.match(refinement, /data-depth="2"[\s\S]*translate\(-44%, -50%\)/);
  assert.match(refinement, /data-depth="3"[\s\S]*translate\(-37%, -50%\)/);
  assert.doesNotMatch(refinement, /data-depth="[0-3]"[^}]*rotate\(/s);
});

test('Opening Signal ending cards use contextual approved anime artwork', () => {
  assert.match(refinement, /data-ending="break-free"[\s\S]*card-5\.webp/);
  assert.match(refinement, /data-ending="next-act"[\s\S]*card-2\.webp/);
  assert.match(refinement, /data-ending="mixed-ending"[\s\S]*card-4\.webp/);
  assert.match(refinement, /data-ending="pass-the-torch"[\s\S]*card-3\.webp/);
  assert.match(refinement, /ENDING 01/);
  assert.match(refinement, /ENDING 04/);
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

test('refinement styles load last so they override older abstract card/deck rules', () => {
  const frozenIndex = layout.indexOf("./frozen-global.css");
  const polishIndex = layout.indexOf("./product-polish.css");
  const deckIndex = layout.indexOf("./about-deck.css");
  const refinementIndex = layout.indexOf("./interface-refinement.css");
  assert.ok(frozenIndex >= 0 && polishIndex > frozenIndex);
  assert.ok(deckIndex > polishIndex && refinementIndex > deckIndex);
});
