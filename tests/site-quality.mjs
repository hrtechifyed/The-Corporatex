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
const referenceJs = await read('src/reference-exact.js');
const workflowModel = await read('src/story-workflow-model.js');
const storyScenes = await read('public/story-scenes.svg');

const navHrefs = ['index.html', 'share-story.html', 'stories.html', 'more-info.html', 'privacy-safety.html'];
const footerPrimary = 'The Corporate Ex - Powered by - HRTechify - People • Technology • Growth';
const footerSecondary = '© 2026 All Rights Reserved.';

for (const [name, html] of Object.entries(pages)) {
  const nav = html.match(/<nav class="ref-primary-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  const positions = navHrefs.map((href) => nav.indexOf(`href="${href}"`));
  assert.ok(positions.every((position) => position >= 0), `${name}: shared navigation links must exist`);
  assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]), `${name}: navigation order changed`);
  assert.match(html, /src\/reference-exact\.css/, `${name}: shared reference stylesheet missing`);
  assert.match(html, /src\/reference-functional\.css/, `${name}: functional stylesheet missing`);
  assert.match(html, /src\/reference-exact\.js/, `${name}: shared runtime missing`);
  assert.equal((html.match(new RegExp(footerPrimary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1, `${name}: exact primary footer must appear once`);
  assert.equal((html.match(new RegExp(footerSecondary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1, `${name}: exact copyright footer must appear once`);
  assert.match(html, /class="site-footer"/, `${name}: shared footer class missing`);
}

for (const name of ['home', 'share', 'guided', 'freeflow']) {
  assert.doesNotMatch(pages[name], /src\/app-v2\.(?:css|js)/, `${name}: legacy app assets must not alter the reference page`);
}

assert.match(pages.home, /Before you join,<br \/>learn from those who left\./);
assert.match(pages.home, /What others talk about/);
assert.equal((pages.home.match(/<article>/g) || []).length, 4, 'home must keep exactly four trust statements');
assert.match(pages.home, /public\/story-scenes\.svg#personal/);

assert.match(pages.share, /How would you like to share your story\?/);
assert.equal((pages.share.match(/class="ref-choice-card/g) || []).length, 2, 'share page must show exactly two story choices');

assert.match(pages.guided, /data-guided-workflow/);
assert.equal((pages.guided.match(/<button[^>]+class="ref-journey-card/g) || []).length, 8, 'all guided chapters must be semantic buttons');
assert.equal((pages.guided.match(/data-guided-chapter=/g) || []).length, 8, 'all guided chapters must be generated from the shared chapter IDs');
assert.match(pages.guided, /data-guided-editor/);
assert.match(pages.guided, /data-guided-text/);
assert.match(pages.guided, /data-guided-previous/);
assert.match(pages.guided, /data-guided-next/);
assert.match(pages.guided, /data-guided-skip/);
assert.match(pages.guided, /data-guided-review-panel/);
assert.equal((pages.guided.match(/type="checkbox"/g) || []).length, 1, 'guided review must use one final agreement checkbox');
assert.equal((pages.guided.match(/public\/story-scenes\.svg#/g) || []).length, 8, 'every guided card must use a stable SVG scene');

assert.match(pages.freeflow, /data-freeflow-form/);
assert.match(pages.freeflow, /name="employer"/);
assert.match(pages.freeflow, /name="story"/);
assert.match(pages.freeflow, /data-freeflow-count/);
assert.match(pages.freeflow, /data-freeflow-review/);
assert.match(pages.freeflow, /data-freeflow-confirm/);
assert.equal((pages.freeflow.match(/type="checkbox"/g) || []).length, 1, 'free-flow review must use one final agreement checkbox');

assert.match(pages.stories, /Northstar Technologies/);
assert.match(pages.stories, /Atlas Systems/);
assert.match(pages.stories, /Meridian Works/);
assert.doesNotMatch(pages.stories, /Sony|NVIDIA/, 'fictional demonstration stories must not use real employer names');
assert.equal((pages.stories.match(/Illustrative preview/g) || []).length, 0, 'one page-level demonstration notice replaces repeated chips');
assert.match(pages.detail, /fictional demonstration/i);

for (const symbol of ['growth', 'leadership', 'wellbeing', 'change', 'compensation', 'personal', 'ai']) {
  assert.ok(storyScenes.includes(`id="${symbol}"`), `story scene sprite is missing ${symbol}`);
}

assert.match(referenceCss, /\.ref-nav\{/);
assert.match(referenceCss, /@media\(max-width:760px\)/);
assert.match(functionalCss, /\.ref-story-editor/);
assert.match(functionalCss, /\.ref-freeflow-form/);
assert.match(functionalCss, /\.site-footer/);
assert.match(functionalCss, /@keyframes ref-panel-in/);
assert.match(functionalCss, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(functionalCss, /min-height:4[468]px/);

assert.match(referenceJs, /story-workflow-model\.js/);
assert.match(referenceJs, /guidedstoryconfirmed/);
assert.match(referenceJs, /freeflowstoryconfirmed/);
assert.match(referenceJs, /ArrowLeft/);
assert.match(referenceJs, /ArrowRight/);
assert.match(referenceJs, /aria-invalid/);
assert.doesNotMatch(referenceJs, /localStorage|sessionStorage/, 'new story workflows must remain in memory only');
assert.doesNotMatch(workflowModel, /localStorage|sessionStorage/, 'workflow model must remain persistence-neutral');
assert.equal((workflowModel.match(/id: '/g) || []).length, 8, 'workflow model must define exactly eight guided chapters');

console.log('Site quality checks passed: functional story workflows, shared shell, honest demos and stable assets.');
