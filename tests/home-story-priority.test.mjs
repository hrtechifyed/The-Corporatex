import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const runtime = await readFile('src/home-story-priority.js', 'utf8');
const css = await readFile('src/home-story-priority.css', 'utf8');
const build = await readFile('scripts/build.mjs', 'utf8');
const home = await readFile('pages-preview/index.html', 'utf8');

test('published stories are promoted directly below the homepage hero', () => {
  assert.match(runtime, /hero\.after\(stories\)/);
  assert.match(runtime, /stories\.classList\.add\('cx-home-stories-priority'\)/);
  assert.match(runtime, /stories\.after\(guideSection\)/);
  assert.match(runtime, /shell\.append\(archive\)/);
  assert.match(runtime, /cx-home-priority-ready/);
});

test('story-reading guide becomes normal flow content below published stories', () => {
  assert.match(css, /\.cx-home-story-guide-section \.pages-archive/);
  assert.match(css, /position:\s*static !important/);
  assert.match(css, /body\.cx-home-priority-ready \.pages-hero[\s\S]*padding-bottom:\s*0/);
  assert.match(css, /@media \(max-width: 820px\)/);
  assert.match(css, /grid-template-columns:\s*1fr !important/);
});

test('priority runtime loads after story guide polish and before carousel hydration', () => {
  const polish = build.indexOf('src/stories-polish.js');
  const priority = build.indexOf('src/home-story-priority.js');
  const carousel = build.indexOf('src/home-story-carousel.js');
  assert.ok(polish >= 0 && priority > polish && carousel > priority);
  assert.match(build, /src\/home-story-priority\.css/);
});

test('homepage keeps one published stories section and one guide source', () => {
  assert.equal((home.match(/class="pages-section pages-stories"/g) || []).length, 1);
  assert.equal((home.match(/class="pages-archive"/g) || []).length, 1);
});
