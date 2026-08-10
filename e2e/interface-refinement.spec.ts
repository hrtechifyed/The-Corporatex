import { expect, test } from '@playwright/test';

test('desktop primary navigation includes a visible Home link', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about');
  const nav = page.locator('.cx-primary-nav');
  const home = nav.getByRole('link', { name: 'Home' });
  await expect(home).toBeVisible();
  await home.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.site-header')).toHaveAttribute('data-home', 'true');
});

test('Opening Signal cards use contextual anime workplace artwork instead of abstract geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/submit');
  await expect(page.getByRole('heading', { name: 'How did this ending feel?' })).toBeVisible();

  const mappings = [
    ['break-free', 'card-5.webp', 'ENDING 01'],
    ['next-act', 'card-2.webp', 'ENDING 02'],
    ['mixed-ending', 'card-4.webp', 'ENDING 03'],
    ['pass-the-torch', 'card-3.webp', 'ENDING 04'],
  ] as const;

  for (const [ending, asset, label] of mappings) {
    const button = page.locator(`.cx-ending-choice--button[data-ending="${ending}"]`);
    await expect(button).toBeVisible();
    const card = button.locator('.cx-ending-choice__card');
    const beforeImage = await card.evaluate((element) => getComputedStyle(element, '::before').backgroundImage);
    const endingLabel = await card.evaluate((element) => getComputedStyle(element, '::after').content);
    expect(beforeImage).toContain(`/frozen-assets/${asset}`);
    expect(endingLabel).toContain(label);
  }
});
