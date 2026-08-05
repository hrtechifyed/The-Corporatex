import { cp, mkdir, readdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await mkdir('dist/public', { recursive: true });
await cp('public', 'dist/public', { recursive: true });
// Keep root-level copies for older links and hosting configurations.
await cp('public', 'dist', { recursive: true });
await cp('src', 'dist/src', { recursive: true });
await cp('data', 'dist/data', { recursive: true });

for (const file of await readdir('.')) {
  if (file.endsWith('.html')) {
    await cp(file, `dist/${file}`);
  }
}

console.log('Built static site, quality modules and controlled beta data in dist/');
