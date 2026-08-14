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

test('carousel appends a dedicated Stories archive card after five story slots', () => {
  assert.match(script, /More stories\. More sequences\./);
  assert.match(script, /Read more stories →/);
  assert.match(script, /card\.href = 'stories\.html'/);
  assert.match(script, /track\.append\(moreStoriesCard\(\)\)/);
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
