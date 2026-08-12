import { expect, test } from '@playwright/test';

test('desktop primary navigation includes a visible Home link', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about');
  const nav = page.locator('.cx-primary-nav');
  const home = nav.getByRole('link', { name: 'Home' });
  await expect(home).toBeVisible();
  await home.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.pages-header')).toBeVisible();
});

test('top navigation stays anchored at identical geometry across homepage and app routes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/');
  const publicHeader = page.locator('.pages-header');
  await expect(publicHeader).toBeVisible();
  const publicBox = await publicHeader.boundingBox();
  expect(publicBox).not.toBeNull();
  expect(Math.abs(publicBox!.y)).toBeLessThan(1);
  expect(Math.abs(publicBox!.height - 82)).toBeLessThan(1);
  expect(await publicHeader.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');

  await page.goto('/about');
  const appHeader = page.locator('.site-header');
  await expect(appHeader).toBeVisible();
  const appBox = await appHeader.boundingBox();
  expect(appBox).not.toBeNull();
  expect(Math.abs(appBox!.y - publicBox!.y)).toBeLessThan(1);
  expect(Math.abs(appBox!.height - publicBox!.height)).toBeLessThan(1);
  expect(await appHeader.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const mobilePublicBox = await page.locator('.pages-header').boundingBox();
  expect(mobilePublicBox).not.toBeNull();
  expect(Math.abs(mobilePublicBox!.y)).toBeLessThan(1);
  expect(Math.abs(mobilePublicBox!.height - 76)).toBeLessThan(1);

  await page.goto('/browse');
  const mobileAppBox = await page.locator('.site-header').boundingBox();
  expect(mobileAppBox).not.toBeNull();
  expect(Math.abs(mobileAppBox!.y - mobilePublicBox!.y)).toBeLessThan(1);
  expect(Math.abs(mobileAppBox!.height - mobilePublicBox!.height)).toBeLessThan(1);
});

test('Opening Signal cards use the exact homepage contextual anime artwork instead of abstract geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/submit');
  await expect(page.getByRole('heading', { name: 'How did this ending feel?' })).toBeVisible();

  const mappings = [
    ['break-free', 'card-1', 'ENDING 01'],
    ['next-act', 'card-2', 'ENDING 02'],
    ['mixed-ending', 'card-3', 'ENDING 03'],
    ['pass-the-torch', 'card-5', 'ENDING 04'],
  ] as const;

  for (const [ending, asset, label] of mappings) {
    const button = page.locator(`.cx-ending-choice--button[data-ending="${ending}"]`);
    await expect(button).toBeVisible();
    const card = button.locator('.cx-ending-choice__card');
    const beforeImage = await card.evaluate((element) => getComputedStyle(element, '::before').backgroundImage);
    const endingLabel = await card.evaluate((element) => getComputedStyle(element, '::after').content);
    expect(beforeImage).toContain(`/frozen-assets/${asset}`);
    expect(beforeImage).not.toContain('.webp');
    expect(endingLabel).toContain(label);
  }
});
