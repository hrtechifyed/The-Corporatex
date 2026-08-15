import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await mkdir('dist/public', { recursive: true });
await cp('public', 'dist/public', { recursive: true });
await cp('public', 'dist', { recursive: true });
await cp('src', 'dist/src', { recursive: true });

function withProductionRuntime(html, { submit = false } = {}) {
  let output = html;
  for (const stylesheet of ['src/github-shell.css','src/visual-fixes-guide.css','src/guided-anime-fix.css','src/stories-polish.css','src/guided-production.css','src/guided-account-polish.css','src/home-live-signals.css','src/home-story-carousel.css','src/location-autocomplete.css','src/moderation-console.css','src/account-submissions.css','src/login-role.css','src/site-chrome-cleanup.css','src/card-gold-accent.css','src/stories-live-art.css','src/home-published-card.css','src/exit-journey-signal.css','src/footer-compact.css']) {
    if (!output.includes(stylesheet)) output = output.replace('</head>', `  <link rel="stylesheet" href="${stylesheet}" />\n</head>`);
  }
  const candidates = [
    'src/github-production.js',
    'src/journey-fourth-stage.js',
    'src/site-footer.js',
    'src/feedback-nav.js',
    'src/contributor-nav.js',
    'src/stories-polish.js',
    'src/home-live-signals.js',
    'src/home-story-carousel.js',
    'src/account-arrival.js',
    'src/account-submissions.js',
    submit ? 'src/location-autocomplete.js' : '',
    submit ? 'src/guided-production.js' : '',
    submit ? 'src/github-submit.js' : '',
  ].filter(Boolean);
  const scripts = candidates.filter((source) => !output.includes(source)).map((source) => `<script type="module" src="${source}"></script>`).join('\n');
  return scripts ? output.replace('</body>', `${scripts}\n</body>`) : output;
}

for (const file of await readdir('.')) {
  if (file.endsWith('.html')) {
    let html = await readFile(file, 'utf8');
    if (file === 'how-it-works.html' && !html.includes('user-guide.html')) {
      html = html.replace('<a class="cx-how-button" href="guided-story.html">Share Your Story</a>','<a class="cx-how-button" href="guided-story.html">Share Your Story</a>\n          <a class="cx-how-button" href="user-guide.html">How to Use CorporateX</a>');
    }
    await writeFile(`dist/${file}`, withProductionRuntime(html, { submit: file === 'guided-story.html' }));
  }
}
await cp('dist/how-it-works.html', 'dist/more-info.html');
const frozenSourceDir = 'lib/frozen-home-assets';
const frozenOutputDir = 'dist/frozen-assets';
await mkdir(frozenOutputDir, { recursive: true });
async function readFrozenChunk(name) { const source = await readFile(`${frozenSourceDir}/${name}.ts`, 'utf8'); const match = source.match(/export default '([^']+)'/s); if (!match) throw new Error(`Could not read frozen asset chunk: ${name}`); return match[1]; }
const heroParts = await Promise.all(Array.from({ length: 7 }, (_, index) => readFrozenChunk(`hero-${index + 1}`)));
await writeFile(`${frozenOutputDir}/hero.webp`, Buffer.from(heroParts.join(''), 'base64'));
for (let index = 1; index <= 5; index += 1) { const encoded = await readFrozenChunk(`card-${index}`); await writeFile(`${frozenOutputDir}/card-${index}.webp`, Buffer.from(encoded, 'base64')); }
let pagesHtml = await readFile('pages-preview/index.html', 'utf8');
pagesHtml = pagesHtml.replace('<link rel="stylesheet" href="prelaunch-pages-fixes.css" />','<link rel="stylesheet" href="prelaunch-pages-fixes.css" />\n  <link rel="stylesheet" href="navbar-fix.css" />');
pagesHtml = withProductionRuntime(pagesHtml);
await writeFile('dist/index.html', pagesHtml);
await cp('pages-preview/github-pages-current.css', 'dist/github-pages-current.css');
await cp('pages-preview/prelaunch-pages-fixes.css', 'dist/prelaunch-pages-fixes.css');
await cp('pages-preview/navbar-fix.css', 'dist/navbar-fix.css');
console.log('Built GitHub Pages production frontend with validated locations, password-based contributor access, moderator workflow, live signals, latest published story carousel, unified cards, responsive footer and one anime shell.');