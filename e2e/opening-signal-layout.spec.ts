import { expect, test } from '@playwright/test';

const expectedAssets = [
  '/frozen-assets/card-1',
  '/frozen-assets/card-2',
  '/frozen-assets/card-3',
  '/frozen-assets/card-5',
];

test('Opening Signal uses a 2x2 desktop grid with the exact homepage ending images', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/submit');

  const grid = page.locator('.cx-ending-choice-grid--flow');
  await expect(grid).toBeVisible();

  const cards = grid.locator('.cx-ending-choice--button');
  await expect(cards).toHaveCount(4);

  const boxes = await Promise.all([0, 1, 2, 3].map((index) => cards.nth(index).boundingBox()));
  boxes.forEach((box) => expect(box).not.toBeNull());

  expect(Math.abs(boxes[0]!.y - boxes[1]!.y)).toBeLessThanOrEqual(3);
  expect(Math.abs(boxes[2]!.y - boxes[3]!.y)).toBeLessThanOrEqual(3);
  expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.y + 100);
  expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x);
  expect(boxes[2]!.x).toBeLessThan(boxes[3]!.x);

  for (let index = 0; index < expectedAssets.length; index += 1) {
    const image = await cards.nth(index).locator('.cx-ending-choice__card').evaluate((node) =>
      getComputedStyle(node, '::before').backgroundImage,
    );
    expect(image).toContain(expectedAssets[index]);
    expect(image).not.toContain('.webp');

    const response = await request.get(expectedAssets[index]);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
});

test('Opening Signal extends the homepage cinematic environment below the cards', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/submit');

  const bodyBackground = await page.locator('body.cx-body').evaluate((node) => getComputedStyle(node).backgroundImage);
  expect(bodyBackground).toContain('/frozen-assets/hero');

  const lowerBackground = await page.locator('main#main').evaluate((node) => getComputedStyle(node, '::before').backgroundImage);
  expect(lowerBackground).toContain('/frozen-assets/hero');
});

test('Opening Signal collapses the 2x2 grid to one column on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/submit');

  const cards = page.locator('.cx-ending-choice-grid--flow .cx-ending-choice--button');
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(Math.abs(first!.x - second!.x)).toBeLessThanOrEqual(3);
  expect(second!.y).toBeGreaterThan(first!.y + 100);
});
