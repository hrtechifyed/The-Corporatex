import assert from 'node:assert/strict';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

async function collect(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(full, extensions));
    else if (extensions.some((extension) => entry.name.endsWith(extension))) files.push(full);
  }
  return files;
}

const jsFiles = await collect('src', ['.js']);
const cssFiles = await collect('src', ['.css']);
const assetFiles = await collect('public', ['.svg', '.webp', '.png', '.jpg', '.jpeg']);
const htmlFiles = (await readdir('.')).filter((file) => file.endsWith('.html'));

const sizeOf = async (file) => (await stat(file)).size;
const sum = async (files) => (await Promise.all(files.map(sizeOf))).reduce((total, size) => total + size, 0);
const largest = async (files) => Math.max(0, ...await Promise.all(files.map(sizeOf)));

const budgets = {
  totalJavaScript: 180 * 1024,
  totalCss: 240 * 1024,
  largestHtml: 60 * 1024,
  largestAsset: 500 * 1024,
};

assert.ok(await sum(jsFiles) <= budgets.totalJavaScript, 'JavaScript budget exceeded');
assert.ok(await sum(cssFiles) <= budgets.totalCss, 'CSS budget exceeded');
assert.ok(await largest(htmlFiles) <= budgets.largestHtml, 'HTML page budget exceeded');
assert.ok(await largest(assetFiles) <= budgets.largestAsset, 'Image/SVG asset budget exceeded');

console.log('Performance budgets passed.');
console.log({
  javascriptBytes: await sum(jsFiles),
  cssBytes: await sum(cssFiles),
  largestHtmlBytes: await largest(htmlFiles),
  largestAssetBytes: await largest(assetFiles),
});
