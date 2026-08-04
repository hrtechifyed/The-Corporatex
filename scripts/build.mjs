import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await cp('public', 'dist', { recursive: true });
await cp('src', 'dist/src', { recursive: true });
const html = await readFile('index.html', 'utf8');
await writeFile('dist/index.html', html);
console.log('Built static site in dist/');
