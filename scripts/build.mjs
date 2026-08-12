import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await mkdir('dist/public', { recursive: true });
await cp('public', 'dist/public', { recursive: true });
// Keep root-level copies for older links and hosting configurations.
await cp('public', 'dist', { recursive: true });
await cp('src', 'dist/src', { recursive: true });

for (const file of await readdir('.')) {
  if (file.endsWith('.html')) {
    await cp(file, `dist/${file}`);
  }
}

// GitHub Pages is static, so materialize the same frozen WebP artwork used by the live Next.js app.
const frozenSourceDir = 'lib/frozen-home-assets';
const frozenOutputDir = 'dist/frozen-assets';
await mkdir(frozenOutputDir, { recursive: true });

async function readFrozenChunk(name) {
  const source = await readFile(`${frozenSourceDir}/${name}.ts`, 'utf8');
  const match = source.match(/export default '([^']+)'/s);
  if (!match) throw new Error(`Could not read frozen asset chunk: ${name}`);
  return match[1];
}

const heroParts = await Promise.all(Array.from({ length: 7 }, (_, index) => readFrozenChunk(`hero-${index + 1}`)));
await writeFile(`${frozenOutputDir}/hero.webp`, Buffer.from(heroParts.join(''), 'base64'));

for (let index = 1; index <= 5; index += 1) {
  const encoded = await readFrozenChunk(`card-${index}`);
  await writeFile(`${frozenOutputDir}/card-${index}.webp`, Buffer.from(encoded, 'base64'));
}

// Overlay the current public-facing homepage specifically for GitHub Pages.
// Server-only actions deliberately link back to the live Render app.
await cp('pages-preview/index.html', 'dist/index.html');
await cp('pages-preview/github-pages-current.css', 'dist/github-pages-current.css');

console.log('Built static site in dist/ with current CorporateX GitHub Pages preview.');
