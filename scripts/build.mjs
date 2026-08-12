import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await mkdir('dist/public', { recursive: true });
await cp('public', 'dist/public', { recursive: true });
// Keep root-level copies for older links and hosting configurations.
await cp('public', 'dist', { recursive: true });
await cp('src', 'dist/src', { recursive: true });

function withProductionRuntime(html, { submit = false } = {}) {
  let output = html;
  if (!output.includes('src/github-shell.css')) {
    output = output.replace('</head>', '  <link rel="stylesheet" href="src/github-shell.css" />\n</head>');
  }
  if (output.includes('github-production.js')) return output;
  const scripts = [
    '<script type="module" src="src/github-production.js"></script>',
    submit ? '<script type="module" src="src/github-submit.js"></script>' : '',
  ].filter(Boolean).join('\n');
  return output.replace('</body>', `${scripts}\n</body>`);
}

for (const file of await readdir('.')) {
  if (file.endsWith('.html')) {
    const html = await readFile(file, 'utf8');
    await writeFile(`dist/${file}`, withProductionRuntime(html, { submit: file === 'guided-story.html' }));
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
let pagesHtml = await readFile('pages-preview/index.html', 'utf8');
pagesHtml = pagesHtml.replace(
  '<link rel="stylesheet" href="prelaunch-pages-fixes.css" />',
  '<link rel="stylesheet" href="prelaunch-pages-fixes.css" />\n  <link rel="stylesheet" href="navbar-fix.css" />',
);
pagesHtml = withProductionRuntime(pagesHtml);
await writeFile('dist/index.html', pagesHtml);
await cp('pages-preview/github-pages-current.css', 'dist/github-pages-current.css');
await cp('pages-preview/prelaunch-pages-fixes.css', 'dist/prelaunch-pages-fixes.css');
await cp('pages-preview/navbar-fix.css', 'dist/navbar-fix.css');

console.log('Built GitHub Pages production frontend with one responsive anime shell and direct Supabase runtime.');
