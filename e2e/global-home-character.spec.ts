import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/browse',
  '/more',
  '/about',
  '/privacy',
  '/terms',
  '/community-guidelines',
];

test('non-home pages reuse the homepage character asset in the shared upper-right rail', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const route of publicRoutes) {
    await page.goto(route);
    const backgroundImage = await page.locator('body.cx-body').evaluate((node) => getComputedStyle(node).backgroundImage);
    expect(backgroundImage).toContain('/frozen-assets/hero');
  }
});

test('the homepage keeps its original character without adding the non-home background copy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  const hero = page.locator('.pages-hero-art');
  await expect(hero).toBeVisible();
  const heroImage = await hero.evaluate((node) => getComputedStyle(node).backgroundImage);
  expect(heroImage).toContain('/pages-home/frozen-assets/hero.webp');

  const bodyImage = await page.locator('body').evaluate((node) => getComputedStyle(node).backgroundImage);
  expect(bodyImage).not.toContain('/frozen-assets/hero');
});

test('contributor pages reserve the right-side character rail instead of covering it with the form card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/submit/scene?ending=break-free&from=home');

  await expect(page.getByRole('heading', { name: 'Setting the Scene', exact: true })).toBeVisible();
  const card = page.locator('.cx-flow-card');
  const cardBox = await card.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(cardBox!.width).toBeLessThanOrEqual(960);
  expect(1440 - (cardBox!.x + cardBox!.width)).toBeGreaterThanOrEqual(320);

  const backgroundImage = await page.locator('body.cx-body').evaluate((node) => getComputedStyle(node).backgroundImage);
  expect(backgroundImage).toContain('/frozen-assets/hero');
});
