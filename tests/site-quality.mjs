import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const pages = {
  home: await read('index.html'),
  share: await read('share-story.html'),
  guided: await read('guided-story.html'),
  freeflow: await read('freeflow-story.html'),
};
const css = await read('src/reference-exact.css');
const js = await read('src/reference-exact.js');
const navHrefs = ['index.html', 'share-story.html', 'stories.html', 'more-info.html', 'privacy-safety.html'];
for (const [name, html] of Object.entries(pages)) {
  const nav = html.match(/<nav class="ref-primary-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  const positions = navHrefs.map((href) => nav.indexOf(`href="${href}"`));
  assert.ok(positions.every((position) => position >= 0), `${name}: the locked navigation links must exist`);
  assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]), `${name}: navigation order changed`);
  assert.match(html, /src\/reference-exact\.css/, `${name}: locked stylesheet missing`);
  assert.match(html, /src\/reference-exact\.js/, `${name}: locked script missing`);
  assert.doesNotMatch(html, /src\/app-v2\.js|story-door-stage|theme-decision-root|form-panel|data-confirm/, `${name}: legacy runtime or form layout leaked into locked page`);
}

assert.match(pages.home, /Before you join,<br \/>learn from those who left\./);
assert.match(pages.home, /Real exit stories\. Real insights\. Smarter career moves\./);
assert.match(pages.home, /What others talk about/);
assert.equal((pages.home.match(/<article>/g) || []).length, 4, 'home must keep exactly four trust statements');
assert.match(pages.home, /The Corporate Ex<\/span><b>•<\/b><span>Powered by <u>HRTechify<\/u>/);

assert.match(pages.share, /How would you like to share your story\?/);
assert.equal((pages.share.match(/class="ref-choice-card/g) || []).length, 2, 'share page must show exactly two story choices');
assert.match(pages.share, /Start Guided Story/);
assert.match(pages.share, /Start Free-flow Story/);

assert.match(pages.guided, /Tell the arc,<br \/>not just the ending\./);
assert.equal((pages.guided.match(/class="ref-journey-card/g) || []).length, 8, 'guided page must keep exactly eight chapter cards');
for (const title of ['The Beginning', 'The Promise', 'The Good Part', 'The Shift', 'The Tipping Point', 'The Lesson', 'The AI Chapter', 'Who Thrives Here?']) {
  assert.ok(pages.guided.includes(title), `guided page is missing ${title}`);
}

assert.match(pages.freeflow, /Your experience,<br \/>in your own order\./);
assert.equal((pages.freeflow.match(/<article>/g) || []).length, 4, 'free-flow page must keep exactly four supporting ideas');
for (const title of ['No structure', 'Your voice', 'What matters', 'Switch anytime']) {
  assert.ok(pages.freeflow.includes(title), `free-flow page is missing ${title}`);
}

const expectedSceneUses = [
  'public/story-scenes.svg#personal',
  'public/story-scenes.svg#wellbeing',
  'public/story-scenes.svg#growth',
  'public/story-scenes.svg#leadership',
  'public/story-scenes.svg#change',
  'public/story-scenes.svg#ai',
];
for (const scene of expectedSceneUses) {
  assert.ok(Object.values(pages).some((html) => html.includes(scene)), `locked pages are missing scene ${scene}`);
}

assert.match(css, /\.ref-nav\{/);
assert.match(css, /\.ref-choice-grid\{/);
assert.match(css, /grid-template-columns:repeat\(8,minmax\(0,1fr\)\)/);
assert.match(css, /\.ref-freeflow-features\{/);
assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(js, /localStorage|sessionStorage/, 'locked page runtime must not persist interface state');
assert.match(js, /data-ref-menu/);
assert.match(js, /data-ref-signin/);

console.log('Four-page reference fidelity checks passed.');
