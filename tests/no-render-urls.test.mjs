import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import test from 'node:test';

const root = process.cwd();
const ignoredDirs = new Set(['.git', '.next', 'dist', 'node_modules', 'test-results', 'prelaunch-visuals']);
const legacyHost = ['corporatex', '.onrender', '.com'].join('');
const forbiddenUrls = [`https://${legacyHost}`, `http://${legacyHost}`];
const textExtensions = /\.(?:c?js|mjs|ts|tsx|html|css|md|json|ya?ml|toml|txt|env|example)$/i;

async function collect(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await collect(join(dir, entry.name), files);
      continue;
    }
    const path = join(dir, entry.name);
    if (textExtensions.test(entry.name) && (await stat(path)).size < 2_000_000) files.push(path);
  }
  return files;
}

test('repository contains no legacy Render URLs', async () => {
  const offenders = [];
  for (const path of await collect(root)) {
    const text = await readFile(path, 'utf8');
    if (forbiddenUrls.some((url) => text.includes(url))) offenders.push(relative(root, path));
  }
  assert.deepEqual(offenders, [], `Remove legacy hosting URLs from: ${offenders.join(', ')}`);
});
