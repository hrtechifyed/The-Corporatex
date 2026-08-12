import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
] as const;

const publicPages = [
  { name: 'home', path: '/' },
  { name: 'how-it-works', path: '/more' },
  { name: 'about', path: '/about' },
  { name: 'submit', path: '/submit' },
  { name: 'browse', path: '/browse' },
] as const;

async function primeOffscreenContent(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.round(window.innerHeight * .72));
    const bottom = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    for (let y = 0; y <= bottom; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    window.scrollTo(0, bottom);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.scrollTo(0, 0);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function assertViewportIntegrity(page: Page) {
  const geometry = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    const rect = heading?.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      headingLeft: rect?.left ?? 0,
      headingRight: rect?.right ?? 0,
      headingTop: rect?.top ?? 0,
    };
  });
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewportWidth + 2);
  expect(geometry.headingLeft).toBeGreaterThanOrEqual(-1);
  expect(geometry.headingRight).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.headingTop).toBeGreaterThanOrEqual(0);
  await expect(page.locator('.site-header')).toBeVisible();
}

test.describe('Prelaunch visual acceptance matrix', () => {
  for (const viewport of viewports) {
    for (const route of publicPages) {
      test(`${route.name} stays inside ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route.path);
        await page.waitForLoadState('domcontentloaded');
        await assertViewportIntegrity(page);
        await primeOffscreenContent(page);
        if (route.name === 'how-it-works') {
          const gap = await page.evaluate(() => {
            const lastSection = document.querySelector('main#main > .cx-page > section:last-child')?.getBoundingClientRect();
            const footer = document.querySelector('.site-footer')?.getBoundingClientRect();
            if (!lastSection || !footer) return 9999;
            return Math.max(0, footer.top - lastSection.bottom);
          });
          expect(gap).toBeLessThan(120);
        }
        await mkdir('test-results/prelaunch-matrix', { recursive: true });
        await page.screenshot({ path: `test-results/prelaunch-matrix/${route.name}-${viewport.name}.png`, fullPage: route.name !== 'about' });
      });
    }

    test(`Setting the Scene stays inside ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/submit');
      await page.getByRole('radio', { name: /Mixed Ending/i }).click();
      await expect(page).toHaveURL(/\/submit\/scene$/);
      await assertViewportIntegrity(page);
      await expect(page.getByText('Setting the Scene', { exact: true }).first()).toBeVisible();
      await primeOffscreenContent(page);
      await mkdir('test-results/prelaunch-matrix', { recursive: true });
      await page.screenshot({ path: `test-results/prelaunch-matrix/setting-the-scene-${viewport.name}.png`, fullPage: true });
    });
  }
});

test('all launch-critical frozen resources respond successfully', async ({ request }) => {
  for (const asset of ['hero', 'card-1', 'card-2', 'card-3', 'card-4', 'card-5']) {
    const response = await request.get(`/frozen-assets/${asset}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
});
