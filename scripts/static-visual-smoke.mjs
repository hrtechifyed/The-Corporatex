import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const port = 4173;
const base = `http://127.0.0.1:${port}`;
const artifactDir = 'prelaunch-artifacts/github-pages';
const server = spawn('python3', ['-m', 'http.server', String(port), '-d', 'dist'], { stdio: ['ignore', 'pipe', 'pipe'] });

async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error('Static GitHub Pages preview server did not start.');
}

async function prime(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.round(window.innerHeight * .72));
    const bottom = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    for (let y = 0; y <= bottom; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  await mkdir(artifactDir, { recursive: true });

  for (const viewport of [
    { name: 'github-pages-desktop-1440', width: 1440, height: 900 },
    { name: 'github-pages-mobile-390', width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    await page.goto(base, { waitUntil: 'domcontentloaded' });

    const integrity = await page.evaluate(() => {
      const actions = document.querySelector('.pages-actions')?.getBoundingClientRect();
      const archive = document.querySelector('.pages-archive')?.getBoundingClientRect();
      const footer = document.querySelector('.pages-footer');
      const howLink = document.querySelector('.pages-nav a[href="#how-it-works"]');
      const aboutLink = document.querySelector('.pages-nav a[href="#about"]');
      const orbit = document.querySelector('.pages-brand-orbit');
      const signal = document.querySelector('.pages-header-signal');
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        actionsBottom: actions?.bottom ?? 0,
        archiveTop: archive?.top ?? 0,
        footerExists: Boolean(footer),
        howLocal: Boolean(howLink),
        aboutLocal: Boolean(aboutLink),
        orbitExists: Boolean(orbit),
        signalExists: Boolean(signal),
        orbitAnimation: orbit ? getComputedStyle(orbit).animationName : 'none',
      };
    });

    if (integrity.scrollWidth > integrity.viewport + 2) throw new Error(`${viewport.name}: horizontal overflow ${integrity.scrollWidth}px > ${integrity.viewport}px.`);
    if (integrity.archiveTop < integrity.actionsBottom + 16) throw new Error(`${viewport.name}: archive collides with hero CTA area.`);
    if (!integrity.footerExists || !integrity.howLocal || !integrity.aboutLocal) throw new Error(`${viewport.name}: static public navigation/footer contract is incomplete.`);
    if (!integrity.orbitExists || !integrity.signalExists) throw new Error(`${viewport.name}: HRTechify logo orbit/signal elements are missing.`);
    if (viewport.width > 820 && integrity.orbitAnimation === 'none') throw new Error(`${viewport.name}: logo orbit animation is not active.`);

    for (const asset of ['hero', 'card-1', 'card-2', 'card-3', 'card-4', 'card-5']) {
      const response = await page.request.get(`${base}/frozen-assets/${asset}.webp`);
      if (!response.ok()) throw new Error(`${viewport.name}: static frozen asset ${asset}.webp returned HTTP ${response.status()}.`);
    }

    await prime(page);
    await page.screenshot({ path: `${artifactDir}/${viewport.name}.png`, fullPage: true });
    await page.close();
  }

  console.log('GitHub Pages static visual smoke passed.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
