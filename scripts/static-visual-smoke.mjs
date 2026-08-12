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

const routes = [
  { slug: '', name: 'home' },
  { slug: 'stories.html', name: 'stories' },
  { slug: 'how-it-works.html', name: 'how-it-works' },
  { slug: 'privacy-safety.html', name: 'privacy' },
];

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  await mkdir(artifactDir, { recursive: true });

  for (const viewport of [
    { name: 'github-pages-desktop-1440', width: 1440, height: 900 },
    { name: 'github-pages-laptop-1024', width: 1024, height: 768 },
    { name: 'github-pages-mobile-390', width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    let expectedHeaderHeight = null;

    for (const route of routes) {
      await page.goto(`${base}/${route.slug}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.cx-unified-header');

      const integrity = await page.evaluate(() => {
        const header = document.querySelector('.cx-unified-header');
        const headerRect = header?.getBoundingClientRect();
        const brand = document.querySelector('.cx-unified-brand__mark');
        const orbit = document.querySelector('.cx-unified-brand__orbit');
        const desktopNav = document.querySelector('.cx-unified-nav');
        const mobileMenu = document.querySelector('.cx-unified-menu');
        const orbitStyle = orbit ? getComputedStyle(orbit, '::after') : null;
        return {
          scrollWidth: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
          headerTop: headerRect?.top ?? -1,
          headerHeight: headerRect?.height ?? 0,
          headerOverflow: header ? getComputedStyle(header).overflow : 'missing',
          brandOverflow: brand ? getComputedStyle(brand).overflow : 'missing',
          desktopDisplay: desktopNav ? getComputedStyle(desktopNav).display : 'missing',
          mobileDisplay: mobileMenu ? getComputedStyle(mobileMenu).display : 'missing',
          orbitExists: Boolean(orbit),
          orbitAnimation: orbitStyle?.animationName || 'none',
          coreLabels: [...document.querySelectorAll('.cx-unified-nav a')].map((a) => a.textContent?.trim()),
        };
      });

      if (integrity.scrollWidth > integrity.viewport + 2) throw new Error(`${viewport.name}/${route.name}: horizontal overflow ${integrity.scrollWidth}px > ${integrity.viewport}px.`);
      if (Math.abs(integrity.headerTop) > 1) throw new Error(`${viewport.name}/${route.name}: shared header moved from the top (${integrity.headerTop}px).`);
      if (expectedHeaderHeight == null) expectedHeaderHeight = integrity.headerHeight;
      if (Math.abs(integrity.headerHeight - expectedHeaderHeight) > 1) throw new Error(`${viewport.name}/${route.name}: header height changed between routes.`);
      if (!integrity.orbitExists || integrity.orbitAnimation === 'none') throw new Error(`${viewport.name}/${route.name}: logo orbit is missing or not animated.`);
      if (integrity.headerOverflow === 'hidden' || integrity.brandOverflow === 'hidden') throw new Error(`${viewport.name}/${route.name}: logo orbit can be clipped by the header/brand container.`);
      for (const label of ['Home', 'Stories', 'How It Works', 'About']) {
        if (!integrity.coreLabels.includes(label)) throw new Error(`${viewport.name}/${route.name}: shared desktop navigation is missing ${label}.`);
      }
      if (viewport.width <= 920) {
        if (integrity.desktopDisplay !== 'none' || integrity.mobileDisplay === 'none') throw new Error(`${viewport.name}/${route.name}: mobile navigation breakpoint is inconsistent.`);
      } else if (integrity.desktopDisplay === 'none' || integrity.mobileDisplay !== 'none') {
        throw new Error(`${viewport.name}/${route.name}: desktop/laptop navigation breakpoint is inconsistent.`);
      }

      if (route.name === 'home') {
        const hero = await page.evaluate(() => {
          const actions = document.querySelector('.pages-actions')?.getBoundingClientRect();
          const archive = document.querySelector('.pages-archive')?.getBoundingClientRect();
          return { actionsBottom: actions?.bottom ?? 0, archiveTop: archive?.top ?? 0 };
        });
        if (hero.archiveTop < hero.actionsBottom + 16) throw new Error(`${viewport.name}: archive collides with hero CTA area.`);
      }

      if (route.name === 'how-it-works') {
        const illustrated = await page.evaluate(() => ({
          plotArt: document.querySelectorAll('.cx-how-card__art img').length,
          trustArt: document.querySelectorAll('.cx-how-trust-card img').length,
          heroArt: document.querySelectorAll('.cx-how-hero__art img').length,
          sections: [...document.querySelectorAll('.cx-how-section')].map((section) => Boolean(section.querySelector('img,.cx-how-card,.cx-how-trust-card,.cx-how-forward__panel'))),
        }));
        if (illustrated.heroArt !== 1 || illustrated.plotArt !== 3 || illustrated.trustArt !== 3) throw new Error(`${viewport.name}: How It Works lost its anime illustration system.`);
        if (illustrated.sections.some((value) => !value)) throw new Error(`${viewport.name}: How It Works contains a plain text-only section.`);
      }
    }

    for (const asset of ['hero', 'card-1', 'card-2', 'card-3', 'card-4', 'card-5']) {
      const response = await page.request.get(`${base}/frozen-assets/${asset}.webp`);
      if (!response.ok()) throw new Error(`${viewport.name}: static frozen asset ${asset}.webp returned HTTP ${response.status()}.`);
    }

    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.cx-unified-header');
    await prime(page);
    await page.screenshot({ path: `${artifactDir}/${viewport.name}.png`, fullPage: true });

    await page.goto(`${base}/how-it-works.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.cx-unified-header');
    await prime(page);
    await page.screenshot({ path: `${artifactDir}/${viewport.name}-how-it-works.png`, fullPage: true });
    await page.close();
  }

  console.log('GitHub Pages static visual smoke passed: shared header geometry, visible logo orbit and illustrated How It Works page are stable across desktop, laptop and mobile.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
