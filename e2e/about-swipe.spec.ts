import { expect, test } from '@playwright/test';

test.describe('About swipe deck', () => {
  test('stays inside one desktop viewport and advances the stacked cards', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about');

    await expect(page.getByRole('heading', { name: /Workplace truth has a timeline/i })).toBeVisible();
    await expect(page.locator('.cx-about-card-deck > li')).toHaveCount(4);
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Experience');
    await expect(page.locator('.cx-about-card-deck > li[data-depth="1"]')).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerHeight,
      body: document.documentElement.scrollHeight,
      overflow: getComputedStyle(document.body).overflow,
    }));
    expect(dimensions.overflow).toBe('hidden');
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);

    await page.getByRole('button', { name: 'Next card' }).click();
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Sequence');
    await expect(page.getByText('SWIPE · 02 / 04')).toBeVisible();

    await page.getByRole('button', { name: 'Show Decision' }).click();
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Decision');
  });

  test('supports keyboard navigation without requiring page scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/about');
    const deck = page.locator('.cx-about-deck-visual');
    await deck.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Sequence');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Experience');
  });
});
