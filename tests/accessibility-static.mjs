import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const pages = (await readdir('.')).filter((file) => file.endsWith('.html')).sort();

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  assert.match(html, /<html[^>]+lang="en"/i, `${page}: document language is required`);
  assert.match(html, /<meta[^>]+name="viewport"/i, `${page}: viewport metadata is required`);
  assert.match(html, /<title>[^<]+<\/title>/i, `${page}: a descriptive title is required`);
  assert.match(html, /class="skip-link"[^>]+href="#main"/i, `${page}: skip link must target main`);
  assert.match(html, /<main[^>]+id="main"/i, `${page}: main landmark requires id=main`);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${page}: exactly one h1 is required`);
  assert.match(html, /<nav[^>]+aria-label=/i, `${page}: navigation landmarks require labels`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${page}: duplicate ids are not allowed`);

  for (const image of html.match(/<img\b[^>]*>/gi) || []) {
    assert.match(image, /\salt="[^"]*"/i, `${page}: every image needs an alt attribute`);
  }

  for (const button of html.match(/<button\b[^>]*>/gi) || []) {
    assert.match(button, /\stype="(button|submit|reset)"/i, `${page}: buttons need an explicit type`);
  }
}

const guided = await readFile('guided-story.html', 'utf8');
const freeflow = await readFile('freeflow-story.html', 'utf8');
assert.match(guided, /aria-label="Choose story format"/, 'Guided mode switch requires an accessible label');
assert.match(freeflow, /aria-label="Choose story format"/, 'Free-flow mode switch requires an accessible label');

console.log(`Static accessibility checks passed for ${pages.length} pages.`);
