import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');

const [
  header, footer, about, css, refinement, openingRefinement, readiness, locationRoute, scene, scenePage,
  liveCloud, finalize, handoff, home, complete, layout, pagesPreview, pagesCss, pagesFixes, staticBuild,
  account, moderation, moderationApi, moderationControls, privacy, browse,
] = await Promise.all([
  read('components/site-header.tsx'), read('components/site-footer.tsx'), read('app/about/page.tsx'), read('app/product-polish.css'),
  read('app/interface-refinement.css'), read('app/opening-signal-refinement.css'), read('app/launch-readiness.css'),
  read('app/api/location/validate/route.ts'), read('components/validated-scene-step.tsx'), read('app/submit/scene/page.tsx'),
  read('components/live-signal-cloud.tsx'), read('app/api/submission/finalize/route.ts'), read('lib/submission-handoff.ts'),
  read('app/page.tsx'), read('app/submit/complete/page.tsx'), read('app/layout.tsx'), read('pages-preview/index.html'),
  read('pages-preview/github-pages-current.css'), read('pages-preview/prelaunch-pages-fixes.css'), read('scripts/build.mjs'),
  read('app/account/page.tsx'), read('app/moderation/page.tsx'), read('app/api/moderation/[id]/route.ts'), read('components/moderation-controls.tsx'),
  read('app/privacy/page.tsx'), read('app/browse/page.tsx'),
]);

test('primary navigation is animated, includes Home and session-aware My Stories', () => {
  assert.match(header, /\['Home', '\/'\]/);
  assert.match(header, /\['About', '\/about'\]/);
  assert.match(header, /cx-brand-orbit/);
  assert.match(header, /cx-header-signal/);
  assert.match(header, /createBrowserClient/);
  assert.match(header, /signedIn \? 'My Stories' : 'Sign In'/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('GitHub Pages is the canonical public product with local interactive routes', () => {
  for (const copy of ['Not a score.', 'FOUR HONEST ENDINGS', 'SIGNALS FROM PEOPLE WHO WERE THERE', 'LIVE SIGNAL CLOUD', 'PASS IT FORWARD', 'ABOUT CORPORATEX']) assert.match(pagesPreview, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(pagesPreview, /rel="canonical" href="https:\/\/hrtechifyed\.github\.io\/The-Corporatex\/"/);
  assert.match(pagesPreview, /href="#how-it-works"/);
  assert.match(pagesPreview, /href="#about"/);
  assert.match(pagesPreview, /href="stories\.html"/);
  assert.match(pagesPreview, /href="guided-story\.html"/);
  assert.match(pagesPreview, /href="account\.html"/);
  assert.match(pagesPreview, /href="feedback\.html"/);
  assert.doesNotMatch(pagesPreview, /public mirror|Open live CorporateX/i);
  assert.match(pagesFixes, /pages-brand-orbit/);
  assert.match(pagesFixes, /pages-header-signal/);
  assert.match(pagesFixes, /prefers-reduced-motion/);
  assert.match(pagesFixes, /\.pages-archive\{position:relative!important/);
  assert.match(pagesCss, /frozen-assets\/hero\.webp/);
  assert.match(staticBuild, /prelaunch-pages-fixes\.css/);
});

test('GitHub Pages remains truthful while the confirmed archive is forming', () => {
  assert.match(pagesPreview, /genuine, moderated workplace stories/i);
  assert.match(pagesPreview, /Private moderation stays private/i);
  assert.doesNotMatch(pagesPreview, /Northstar Technologies|Atlas Systems|Meridian Works|10K\+/i);
  assert.equal((pagesPreview.match(/class="pages-ending-card"/g) || []).length, 4);
  assert.equal((pagesPreview.match(/pages-story-card--forming/g) || []).length, 1);
});

test('About keeps the one-screen narrative while launch safeguards fix artwork routes and gutters', () => {
  assert.match(about, /Workplace truth has a <em>timeline\.<\/em>/);
  for (const word of ['Experience', 'Sequence', 'Signal', 'Decision']) assert.match(about, new RegExp(word));
  assert.match(readiness, /url\('\/frozen-assets\/card-1'\)/);
  assert.match(readiness, /url\('\/frozen-assets\/card-5'\)/);
  assert.doesNotMatch(readiness, /frozen-assets\/card-[1-5]\.webp/);
  assert.match(readiness, /max\(32px, calc\(\(100vw - 1440px\) \/ 2\)\)/);
});

test('Opening Signal uses the exact homepage ending artwork mapping', () => {
  assert.match(openingRefinement, /data-ending="break-free"[\s\S]*--cx-frozen-card-1/);
  assert.match(openingRefinement, /data-ending="next-act"[\s\S]*--cx-frozen-card-2/);
  assert.match(openingRefinement, /data-ending="mixed-ending"[\s\S]*--cx-frozen-card-3/);
  assert.match(openingRefinement, /data-ending="pass-the-torch"[\s\S]*--cx-frozen-card-5/);
});

test('footer legal copy is exactly the approved two lines', () => {
  assert.match(footer, /CorporateX — Powered by HRTechify · People · Technology · Growth/);
  assert.match(footer, /© 2026 All Rights Reserved\. Stories are contributor perspectives/);
});

test('Setting the Scene verifies real locations, supports outage fallback and requires deliberate context choices', () => {
  assert.match(scenePage, /ValidatedSceneStep/);
  assert.match(scene, /Setting the Scene/);
  assert.match(scene, /Choose tenure/);
  assert.match(scene, /Choose arrangement/);
  assert.match(scene, /Prefer not to say/);
  assert.match(scene, /Continue with this location/);
  assert.match(scene, /\/api\/location\/validate\?q=/);
  assert.match(locationRoute, /nominatim\.openstreetmap\.org\/search/);
  assert.doesNotMatch(scene, /useEffect\([^)]*location\/validate/s);
});

test('incoming signal cloud exposes predefined safe labels and confirmed labels link to a real label filter', () => {
  assert.match(home, /LiveSignalCloud/);
  assert.match(liveCloud, /SAFE_LIVE_LABELS/);
  assert.match(liveCloud, /pending_moderation/);
  assert.match(liveCloud, /\/browse\?signal=/);
  assert.match(browse, /experience_labels/);
  assert.match(browse, /q\.signal/);
  assert.doesNotMatch(liveCloud, /original_text|guided_answers|approved_summary/);
  assert.match(finalize, /shift_topic:/);
  assert.match(finalize, /status: 'pending_moderation'/);
  assert.match(complete, /Your signal is live\. Your story is still private\./);
});

test('submission is backed by a private recoverable handoff and idempotent finalization', () => {
  assert.match(handoff, /status: 'draft'/);
  assert.match(handoff, /draft\.draftId/);
  assert.match(finalize, /handoffId/);
  assert.match(finalize, /idempotent: true/);
  assert.match(finalize, /\['pending_moderation', 'published'\]/);
});

test('moderation cannot publish anything other than the exact reviewed saved public copy', () => {
  assert.match(moderation, /What will be published/);
  assert.match(moderation, /experience_highlights/);
  assert.match(moderation, /experience_labels/);
  assert.match(moderation, /Community report queue/);
  assert.match(moderationControls, /publicCopyDirty/);
  assert.match(moderationControls, /Save the public headline\/summary edits first/);
  assert.match(moderationControls, /disabled=\{!previewReviewed \|\| publicCopyDirty\}/);
  assert.match(moderationApi, /publicPreviewReviewed/);
  assert.match(moderationApi, /Review and confirm the exact public preview/);
  assert.match(moderationApi, /input\.headline !== experience\.approved_headline/);
  assert.match(moderationApi, /public copy changed after the preview was generated/i);
});

test('My Stories uses human status language and no legacy journey links', () => {
  assert.match(account, /In private review/);
  assert.match(account, /Changes requested/);
  assert.match(account, /Not published/);
  assert.match(account, /\/account\/story\//);
  assert.doesNotMatch(account, /\/submit\/\$\{record\.id\}\/(guided|analysis|review)/);
});

test('privacy copy describes the actual narrow safety screen and recoverable verification boundary', () => {
  assert.match(privacy, /private recoverable handoff/);
  assert.match(privacy, /email addresses, phone numbers and web links/);
  assert.match(privacy, /not a complete identity detector/);
  assert.match(privacy, /does not replace human moderation/);
});

test('launch-readiness stylesheet loads last in the app cascade', () => {
  const launchIndex = layout.indexOf('./launch-readiness.css');
  assert.ok(launchIndex > layout.indexOf('./opening-signal-refinement.css'));
  assert.ok(launchIndex > layout.indexOf('./interface-refinement.css'));
});
