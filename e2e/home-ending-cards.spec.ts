import { expect, test } from '@playwright/test';

test('homepage endings use archive-style image cards instead of abstract geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  const section = page.getByRole('heading', { name: 'An exit is not always a warning.' }).locator('..').locator('..');
  const cards = page.locator('.cx-ending-grid .cx-ending-card');
  await expect(cards).toHaveCount(4);
  await expect(section).toBeVisible();

  for (let index = 0; index < 4; index += 1) {
    const card = cards.nth(index);
    const scene = card.locator('.cx-ending-card__scene');
    await expect(scene).toBeVisible();
    const backgroundImage = await scene.evaluate((node) => getComputedStyle(node).backgroundImage);
    expect(backgroundImage).toContain('/frozen-assets/card-');
  }

  for (const selector of ['.cx-ending-card__sun', '.cx-ending-card__door', '.cx-ending-card__person']) {
    const display = await cards.first().locator(selector).evaluate((node) => getComputedStyle(node).display);
    expect(display).toBe('none');
  }

  await expect(cards.nth(0)).toContainText('Ending 01');
  await expect(cards.nth(0)).toContainText('Break Free');
  await expect(cards.nth(1)).toContainText('Next Act');
  await expect(cards.nth(2)).toContainText('Mixed Ending');
  await expect(cards.nth(3)).toContainText('Pass the Torch');
});
