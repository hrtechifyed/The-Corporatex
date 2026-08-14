import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const script = await readFile('src/home-story-carousel.js', 'utf8');
const css = await readFile('src/home-story-carousel.css', 'utf8');
const build = await readFile('scripts/build.mjs', 'utf8');

test('homepage carousel uses only the five newest published stories', () => {
  assert.match(script, /published_experiences\?select=/);
  assert.match(script, /order=published_at\.desc&limit=5/);
  assert.doesNotMatch(script, /pending_moderation|changes_requested|private_email|profiles/);
  assert.match(script, /rows\.slice\(0, 5\)/);
});

test('five clearly fictional placeholders fill empty live slots and are replaced by published stories', () => {
  assert.match(script, /const DEMO_STORIES = \[/);
  assert.equal((script.match(/demo:true/g) || []).length, 5);
  assert.match(script, /Fictional placeholder only — not an employee submission/);
  assert.match(script, /DEMO_STORIES\.slice\(0, Math\.max\(0, 5 - published\.length\)\)/);
  assert.match(script, /Archive forming · 5 clearly fictional demo placeholders/);
  assert.match(css, /\.cx-home-story-card\.is-demo/);
});

test('carousel contains story cards only and does not append a separate keep-reading card', () => {
  assert.doesNotMatch(script, /function moreStoriesCard/);
  assert.doesNotMatch(script, /More stories\. More sequences\./);
  assert.doesNotMatch(script, /KEEP READING/);
  assert.doesNotMatch(script, /track\.append\(moreStoriesCard\(\)\)/);
  assert.match(script, /stories\.slice\(0, 5\)\.forEach/);
});

test('published cards use safe text nodes, real story links and anime art', () => {
  assert.match(script, /story-detail\.html\?id=/);
  assert.doesNotMatch(script, /innerHTML\s*=/);
  for (const asset of ['card-1.webp', 'card-3.webp', 'card-4.webp', 'card-5.webp']) {
    assert.match(css, new RegExp(asset.replace('.', '\\.')));
  }
});

test('carousel supports flowing navigation without forcing motion-sensitive users', () => {
  assert.match(css, /scroll-snap-type:x mandatory/);
  assert.match(script, /setInterval\(\(\) => move\(1\), 5200\)/);
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(script, /ArrowRight/);
  assert.match(script, /ArrowLeft/);
});

test('production build loads the carousel runtime and styles', () => {
  assert.match(build, /src\/home-story-carousel\.css/);
  assert.match(build, /src\/home-story-carousel\.js/);
});
