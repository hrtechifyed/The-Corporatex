import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const pages = {
  home: await read('index.html'),
  share: await read('share-story.html'),
  guided: await read('guided-story.html'),
  freeflow: await read('freeflow-story.html'),
  stories: await read('stories.html'),
  detail: await read('story-detail.html'),
  more: await read('more-info.html'),
  privacy: await read('privacy-safety.html'),
};
const referenceCss = await read('src/reference-exact.css');
const functionalCss = await read('src/reference-functional.css');
const cinematicCss = await read('src/cinematic-card-system.css');
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

for (const name of ['home', 'share', 'guided', 'freeflow']) {
  assert.doesNotMatch(pages[name], /src\/app-v2\.(?:css|js)/, `${name}: legacy app assets must not alter the reference page`);
}

assert.match(pages.home, /Before you join,<br \/>hear why people left\./);
assert.equal((pages.home.match(/class="ref-home-signal-card/g) || []).length, 5, 'home must use five cinematic signal cards');
assert.equal((pages.home.match(/class="ref-theme-signal-list"[\s\S]*?<\/div>/)?.[0].match(/<a /g) || []).length, 7, 'home theme strip must remain intentionally compact');
assert.equal((pages.home.match(/<article>/g) || []).length, 4, 'home must keep exactly four trust statements');
assert.doesNotMatch(pages.home, /class="ref-word-cloud"/, 'the dense word cloud must not return');

assert.match(pages.share, /Choose your way in\./);
assert.equal((pages.share.match(/class="ref-choice-card/g) || []).length, 2, 'share page must show exactly two story choices');
assert.equal((pages.share.match(/class="ref-card-emblem"/g) || []).length, 2, 'both story choices need the shared emblem treatment');

assert.match(pages.guided, /data-guided-workflow/);
assert.equal((pages.guided.match(/<button[^>]+class="ref-journey-card/g) || []).length, 8, 'all guided chapters must be semantic buttons');
assert.equal((pages.guided.match(/data-guided-chapter=/g) || []).length, 8, 'guided journey must keep eight reusable chapter IDs');
assert.equal((pages.guided.match(/class="ref-card-icon"/g) || []).length, 8, 'all guided cards need the numbered circular emblem');
assert.match(pages.guided, /data-guided-editor/);
assert.match(pages.guided, /data-guided-review-panel/);
assert.equal((pages.guided.match(/type="checkbox"/g) || []).length, 1, 'guided review must use one final agreement checkbox');
assert.equal((pages.guided.match(/public\/story-scenes\.svg#/g) || []).length, 8, 'every guided card must use a stable SVG scene');
assert.doesNotMatch(pages.guided, /What genuinely worked or stayed valuable\?/, 'long helper copy belongs in the editor, not on the card face');

assert.match(pages.freeflow, /data-freeflow-form/);
assert.match(pages.freeflow, /name="employer"/);
assert.match(pages.freeflow, /name="story"/);
assert.match(pages.freeflow, /data-freeflow-count/);
assert.match(pages.freeflow, /data-freeflow-review/);
assert.equal((pages.freeflow.match(/class="ref-route-strip"/g) || []).length, 1, 'free-flow must use one compact route strip');
assert.doesNotMatch(pages.freeflow, /class="ref-freeflow-features"/, 'decorative feature cards must not compete with the writing field');
assert.equal((pages.freeflow.match(/type="checkbox"/g) || []).length, 1, 'free-flow review must use one final agreement checkbox');

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
assert.equal((pages.more.match(/<details class="info-card" open/g) || []).length, 1, 'More page should reveal only one card by default');
assert.equal((pages.privacy.match(/<details class="policy-card" open/g) || []).length, 1, 'Privacy page should reveal only one card by default');

for (const symbol of ['growth', 'leadership', 'wellbeing', 'change', 'compensation', 'personal', 'ai']) {
  assert.ok(storyScenes.includes(`id="${symbol}"`), `story scene sprite is missing ${symbol}`);
}

assert.match(referenceCss, /\.ref-nav\{/);
assert.match(referenceCss, /@media\(max-width:760px\)/);
assert.match(functionalCss, /\.ref-story-editor/);
assert.match(functionalCss, /\.ref-freeflow-form/);
assert.match(functionalCss, /\.site-footer/);
assert.match(cinematicCss, /\.ref-home-card-stage/);
assert.match(cinematicCss, /\.ref-home-signal-card/);
assert.match(cinematicCss, /\.ref-journey-card:nth-child\(8\)/);
assert.match(cinematicCss, /perspective:1500px/);
assert.match(cinematicCss, /\.story-thumb/);
assert.match(cinematicCss, /\.info-card summary/);
assert.match(cinematicCss, /@media\(prefers-reduced-motion:reduce\)/);

assert.match(referenceJs, /story-workflow-model\.js/);
assert.match(referenceJs, /guidedstoryconfirmed/);
assert.match(referenceJs, /freeflowstoryconfirmed/);
assert.match(referenceJs, /ArrowLeft/);
assert.match(referenceJs, /ArrowRight/);
assert.match(referenceJs, /aria-invalid/);
assert.doesNotMatch(referenceJs, /localStorage|sessionStorage/, 'new story workflows must remain in memory only');
assert.doesNotMatch(workflowModel, /localStorage|sessionStorage/, 'workflow model must remain persistence-neutral');
assert.equal((workflowModel.match(/id: '/g) || []).length, 8, 'workflow model must define exactly eight guided chapters');

console.log('Site quality checks passed: cinematic card system, lighter copy, usable workflows and consistent navigation.');
