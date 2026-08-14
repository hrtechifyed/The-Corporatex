import { expect, test } from '@playwright/test';

test.describe('About swipe deck', () => {
  test('stays inside one desktop viewport and advances a straight aligned card stack', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about');

    await expect(page.getByRole('heading', { name: /Workplace truth has a timeline/i })).toBeVisible();
    const cards = page.locator('.cx-about-card-deck > li');
    await expect(cards).toHaveCount(4);
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Start with what actually happened.');
    await expect(page.locator('.cx-about-card-deck > li[data-depth="1"]')).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerHeight,
      body: document.documentElement.scrollHeight,
      overflow: getComputedStyle(document.body).overflow,
    }));
    expect(dimensions.overflow).toBe('hidden');
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);

    const geometry = await cards.evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return {
        centerY: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        rotationB: matrix.b,
        rotationC: matrix.c,
      };
    }));
    const centers = geometry.map((item) => item.centerY);
    expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(2);
    for (const item of geometry) {
      expect(Math.abs(item.rotationB)).toBeLessThan(0.001);
      expect(Math.abs(item.rotationC)).toBeLessThan(0.001);
      expect(item.width).toBeGreaterThan(350);
      expect(item.height).toBeGreaterThan(300);
    }

    await page.getByRole('button', { name: 'Next card' }).click();
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Context changes the meaning.');
    await expect(page.locator('.cx-about-swipe-hint')).toHaveCount(0);

    await page.getByRole('button', { name: 'Show Decision' }).click();
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Turn hindsight into a better question.');
  });

  test('supports keyboard navigation without requiring page scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/about');
    const deck = page.locator('.cx-about-deck-visual');
    await deck.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Context changes the meaning.');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.cx-about-card-deck > li[data-active="true"]')).toContainText('Start with what actually happened.');
  });
});
