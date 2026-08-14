import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const outDir = 'public/pages-home';
const frozenSourceDir = 'lib/frozen-home-assets';
const frozenOutputDir = `${outDir}/frozen-assets`;

await rm(outDir, { recursive: true, force: true });
await mkdir(frozenOutputDir, { recursive: true });

let html = await readFile('pages-preview/index.html', 'utf8');
html = html
  .replace('<link rel="stylesheet" href="github-pages-current.css" />', '<link rel="stylesheet" href="/pages-home/github-pages-current.css" />')
  .replace('<link rel="stylesheet" href="prelaunch-pages-fixes.css" />', '<link rel="stylesheet" href="/pages-home/prelaunch-pages-fixes.css" />\n  <link rel="stylesheet" href="/pages-home/navbar-fix.css" />')
  .replace('<link rel="stylesheet" href="card-footer-cleanup.css" />', '<link rel="stylesheet" href="/pages-home/card-footer-cleanup.css" />')
  .replaceAll('src="hrtechify-logo.svg"', 'src="/hrtechify-logo.svg"')
  .replaceAll('href="hrtechify-logo.svg"', 'href="/hrtechify-logo.svg"');
await writeFile(`${outDir}/index.html`, html);

for (const name of ['github-pages-current.css', 'prelaunch-pages-fixes.css', 'navbar-fix.css', 'card-footer-cleanup.css']) {
  let css = await readFile(`pages-preview/${name}`, 'utf8');
  css = css.replaceAll("url('frozen-assets/", "url('/pages-home/frozen-assets/");
  await writeFile(`${outDir}/${name}`, css);
}

async function readFrozenChunk(name) {
  const source = await readFile(`${frozenSourceDir}/${name}.ts`, 'utf8');
  const match = source.match(/export default '([^']+)'/s);
  if (!match) throw new Error(`Could not read frozen asset chunk: ${name}`);
  return match[1];
}

const heroParts = await Promise.all(
  Array.from({ length: 7 }, (_, index) => readFrozenChunk(`hero-${index + 1}`)),
);
await writeFile(`${frozenOutputDir}/hero.webp`, Buffer.from(heroParts.join(''), 'base64'));

for (let index = 1; index <= 5; index += 1) {
  const encoded = await readFrozenChunk(`card-${index}`);
  await writeFile(`${frozenOutputDir}/card-${index}.webp`, Buffer.from(encoded, 'base64'));
}

console.log('Synced GitHub Pages homepage into the live Next.js public bundle.');
