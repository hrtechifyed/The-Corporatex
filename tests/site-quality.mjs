import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const pages = {
  home: await read('index.html'),
  share: await read('share-story.html'),
  guided: await read('guided-story.html'),
  stories: await read('stories.html'),
  detail: await read('story-detail.html'),
  more: await read('more-info.html'),
  privacy: await read('privacy-safety.html'),
};
const referenceCss = await read('src/reference-exact.css');
const functionalCss = await read('src/reference-functional.css');
const cinematicCss = await read('src/cinematic-card-system.css');
const guidedCss = await read('src/guided-only-aerial.css');
const referenceJs = await read('src/reference-exact.js');
const workflowModel = await read('src/story-workflow-model.js');
const storyScenes = await read('public/story-scenes.svg');

const navHrefs = ['index.html', 'share-story.html', 'stories.html', 'more-info.html', 'privacy-safety.html'];
const footerPrimary = 'The Corporate Ex - Powered by - HRTechify - People • Technology • Growth';
const footerSecondary = '© 2026 All Rights Reserved.';
const decodeStaticEntities = (html) => html
  .replaceAll('&bull;', '•')
  .replaceAll('&copy;', '©')
  .replaceAll('&amp;', '&');

for (const [name, html] of Object.entries(pages)) {
  const nav = html.match(/<nav class="ref-primary-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  const positions = navHrefs.map((href) => nav.indexOf(`href="${href}"`));
  const decoded = decodeStaticEntities(html);
  assert.ok(positions.every((position) => position >= 0), `${name}: shared navigation links must exist`);
  assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]), `${name}: navigation order changed`);
  assert.match(html, /src\/reference-exact\.css/, `${name}: shared reference stylesheet missing`);
  assert.match(html, /src\/reference-functional\.css/, `${name}: functional stylesheet missing`);
  assert.match(html, /src\/cinematic-card-system\.css/, `${name}: cinematic card stylesheet missing`);
  assert.match(html, /src\/reference-exact\.js/, `${name}: shared runtime missing`);
  assert.equal((decoded.match(new RegExp(footerPrimary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1, `${name}: exact primary footer must appear once`);
  assert.equal((decoded.match(new RegExp(footerSecondary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1, `${name}: exact copyright footer must appear once`);
  assert.match(html, /class="site-footer"/, `${name}: shared footer class missing`);
}

for (const name of ['home', 'share', 'guided']) {
  assert.doesNotMatch(pages[name], /src\/app-v2\.(?:css|js)/, `${name}: legacy app assets must not alter the reference page`);
}

await assert.rejects(access('freeflow-story.html'), 'the retired Free-flow page must not be shipped');
assert.doesNotMatch(Object.values(pages).join('\n'), /freeflow-story\.html|FREE-FLOW STORY|Free-flow Story|Start Free-flow|Switch to Free-flow/i, 'no visible page may restore the retired route');

assert.match(pages.home, /Before you join,<br \/>hear why people left\./);
assert.equal((pages.home.match(/class="ref-home-signal-card/g) || []).length, 5, 'home must use five cinematic signal cards');
assert.equal((pages.home.match(/class="ref-theme-signal-list"[\s\S]*?<\/div>/)?.[0].match(/<a /g) || []).length, 7, 'home theme strip must remain intentionally compact');
assert.equal((pages.home.match(/<article>/g) || []).length, 4, 'home must keep exactly four trust statements');
assert.doesNotMatch(pages.home, /class="ref-word-cloud"/, 'the dense word cloud must not return');

assert.match(pages.share, /Tell the arc\./);
assert.equal((pages.share.match(/class="ref-choice-card/g) || []).length, 1, 'share page must show one Guided entry only');
assert.equal((pages.share.match(/class="ref-card-emblem"/g) || []).length, 1, 'the Guided entry needs the shared emblem treatment');
assert.match(pages.share, /src\/guided-only-aerial\.css/);

assert.match(pages.guided, /data-guided-workflow/);
assert.match(pages.guided, /src\/guided-only-aerial\.css/);
assert.equal((pages.guided.match(/<button[^>]+class="ref-journey-card/g) || []).length, 8, 'all guided chapters must be semantic buttons');
assert.equal((pages.guided.match(/data-guided-chapter=/g) || []).length, 8, 'guided journey must keep eight reusable chapter IDs');
assert.equal((pages.guided.match(/class="ref-card-icon"/g) || []).length, 8, 'all guided cards need the numbered circular emblem');
assert.match(pages.guided, /data-guided-company[^>]+required/);
assert.match(pages.guided, /data-guided-team/);
assert.match(pages.guided, /data-guided-location[^>]+required/);
assert.match(pages.guided, /list="guided-location-suggestions"/);
assert.match(pages.guided, /data-guided-review-context="company"/);
assert.match(pages.guided, /data-guided-review-context="team"/);
assert.match(pages.guided, /data-guided-review-context="location"/);
assert.match(pages.guided, /data-guided-editor/);
assert.match(pages.guided, /data-guided-review-panel/);
assert.equal((pages.guided.match(/type="checkbox"/g) || []).length, 1, 'guided review must use one final agreement checkbox');
assert.equal((pages.guided.match(/public\/story-scenes\.svg#/g) || []).length, 8, 'every guided card must use a stable SVG scene');

assert.match(pages.stories, /Northstar Technologies/);
assert.match(pages.stories, /Atlas Systems/);
assert.match(pages.stories, /Meridian Works/);
assert.doesNotMatch(pages.stories, /Sony|NVIDIA/, 'fictional demonstration stories must not use real employer names');
assert.equal((pages.stories.match(/class="story-row card-interactive"/g) || []).length, 10, 'stories directory must render ten reusable cinematic story cards');
assert.equal((pages.stories.match(/class="story-thumb"/g) || []).length, 10, 'every story card must include a relevant visual');
assert.match(pages.detail, /class="story-hero-visual"/);
assert.equal((pages.detail.match(/class="story-section/g) || []).length, 5, 'story detail must preserve five readable narrative chapters');

assert.equal((pages.more.match(/<details class="info-card/g) || []).length, 4, 'More page must use four expandable cards');
assert.equal((pages.privacy.match(/<details class="policy-card/g) || []).length, 6, 'Privacy page must use six expandable cards');
assert.match(pages.privacy, /current Guided Story draft/);

for (const symbol of ['growth', 'leadership', 'wellbeing', 'change', 'compensation', 'personal', 'ai']) {
  assert.ok(storyScenes.includes(`id="${symbol}"`), `story scene sprite is missing ${symbol}`);
}

assert.match(referenceCss, /\.ref-nav\{/);
assert.match(referenceCss, /@media\(max-width:760px\)/);
assert.match(functionalCss, /\.ref-story-editor/);
assert.match(functionalCss, /\.site-footer/);
assert.match(cinematicCss, /\.ref-home-card-stage/);
assert.match(cinematicCss, /\.story-thumb/);
assert.doesNotMatch(guidedCss, /offset-path:\s*path/i, 'guided cards must not use collision-prone motion paths');
assert.doesNotMatch(guidedCss, /translate\(-50%,\s*-50%\)/, 'guided cards must not be negatively anchored into the preceding form');
assert.match(guidedCss, /contain:\s*layout paint/);
assert.match(guidedCss, /overflow:\s*hidden/);
assert.match(guidedCss, /guided-calm-float 18s/);
assert.match(guidedCss, /--card-left:\s*8%/);
assert.match(guidedCss, /--card-left:\s*92%/);
assert.match(guidedCss, /min-width: 1280px/);
assert.match(guidedCss, /hover: hover/);
assert.match(guidedCss, /animation-play-state: paused/);
assert.match(guidedCss, /grid-template-columns:\s*repeat\(4/);
assert.match(guidedCss, /@media \(prefers-reduced-motion: reduce\)/);

assert.match(referenceJs, /story-workflow-model\.js/);
assert.match(referenceJs, /guidedstoryconfirmed/);
assert.match(referenceJs, /validateGuidedContext/);
assert.match(referenceJs, /buildGuidedSubmission/);
assert.match(referenceJs, /data-guided-company/);
assert.match(referenceJs, /data-guided-location/);
assert.match(referenceJs, /ArrowLeft/);
assert.match(referenceJs, /ArrowRight/);
assert.match(referenceJs, /aria-invalid/);
assert.doesNotMatch(referenceJs, /freeflow|FREEFLOW|free-flow/i, 'retired Free-flow runtime must be removed');
assert.doesNotMatch(referenceJs, /localStorage|sessionStorage/, 'guided story state must remain in memory only');
assert.doesNotMatch(workflowModel, /freeflow|FREEFLOW|free-flow/i, 'workflow model must be Guided-only');
assert.doesNotMatch(workflowModel, /localStorage|sessionStorage/, 'workflow model must remain persistence-neutral');
assert.equal((workflowModel.match(/id: '/g) || []).length, 8, 'workflow model must define exactly eight guided chapters');

console.log('Site quality checks passed: Guided-only route, contained aerial cards, required context and consistent navigation.');
