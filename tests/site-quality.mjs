import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const pages = {
  home: await read('index.html'),
  share: await read('share-story.html'),
  guided: await read('guided-story.html'),
  freeflow: await read('freeflow-story.html'),
};
const referenceCss = await read('src/reference-exact.css');
const referenceJs = await read('src/reference-exact.js');
const storyScenes = await read('public/story-scenes.svg');

const navHrefs = ['index.html', 'share-story.html', 'stories.html', 'more-info.html', 'privacy-safety.html'];
for (const [name, html] of Object.entries(pages)) {
  const nav = html.match(/<nav class="ref-primary-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  const positions = navHrefs.map((href) => nav.indexOf(`href="${href}"`));
  assert.ok(positions.every((position) => position >= 0), `${name}: shared navigation links must exist`);
  assert.ok(
    positions.every((position, index) => index === 0 || position > positions[index - 1]),
    `${name}: shared navigation order changed`,
  );
  assert.match(html, /src\/reference-exact\.css/, `${name}: reference stylesheet missing`);
  assert.match(html, /src\/reference-exact\.js/, `${name}: reference runtime missing`);
  assert.doesNotMatch(html, /src\/app-v2\.(?:css|js)/, `${name}: incompatible legacy stylesheet or runtime leaked into a reference page`);
}

assert.match(pages.home, /Before you join,<br \/>learn from those who left\./);
assert.match(pages.home, /Real exit stories\. Real insights\. Smarter career moves\./);
assert.match(pages.home, /What others talk about/);
assert.equal((pages.home.match(/<article>/g) || []).length, 4, 'home must keep exactly four trust statements');
assert.match(pages.home, /public\/story-scenes\.svg#personal/);
assert.match(pages.home, /class="ref-home-footer"/);

assert.match(pages.share, /How would you like to share your story\?/);
assert.equal((pages.share.match(/class="ref-choice-card/g) || []).length, 2, 'share page must show exactly two story choices');
assert.match(pages.share, /public\/story-scenes\.svg#wellbeing/);
assert.match(pages.share, /public\/story-scenes\.svg#personal/);

assert.match(pages.guided, /Tell the arc,<br \/>not just the ending\./);
assert.equal((pages.guided.match(/class="ref-journey-card/g) || []).length, 8, 'guided page must keep exactly eight chapter cards');
for (const title of ['The Beginning', 'The Promise', 'The Good Part', 'The Shift', 'The Tipping Point', 'The Lesson', 'The AI Chapter', 'Who Thrives Here?']) {
  assert.ok(pages.guided.includes(title), `guided page is missing ${title}`);
}
assert.equal((pages.guided.match(/public\/story-scenes\.svg#/g) || []).length, 8, 'every guided card must use a stable SVG scene');

assert.match(pages.freeflow, /Your experience,<br \/>in your own order\./);
assert.equal((pages.freeflow.match(/<article>/g) || []).length, 4, 'free-flow page must keep exactly four supporting ideas');
assert.match(pages.freeflow, /public\/story-scenes\.svg#wellbeing/);

for (const [name, html] of Object.entries(pages)) {
  assert.doesNotMatch(html, /href="#(?:home-hero|share-|guided-|freeflow-hero)/, `${name}: fragile injected artwork reference remains`);
}

for (const symbol of ['growth', 'leadership', 'wellbeing', 'change', 'compensation', 'personal', 'ai']) {
  assert.ok(storyScenes.includes(`id="${symbol}"`), `story scene sprite is missing ${symbol}`);
}

assert.match(referenceCss, /\.ref-nav\{/);
assert.match(referenceCss, /\.ref-home-main\{/);
assert.match(referenceCss, /\.ref-choice-grid\{/);
assert.match(referenceCss, /\.ref-freeflow-features\{/);
assert.match(referenceCss, /@media\(max-width:760px\)/);
assert.match(referenceCss, /@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(referenceJs, /reference-art-lock-|injectReferenceArtwork|import\(/, 'reference runtime must not execute generated artwork modules');
assert.doesNotMatch(referenceJs, /localStorage|sessionStorage/, 'reference runtime must not persist interface state');
assert.match(referenceJs, /data-ref-menu/);
assert.match(referenceJs, /data-ref-signin/);

console.log('Site quality checks passed with stable SVG artwork and consistent reference assets.');
