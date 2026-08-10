import { expect, test } from '@playwright/test';

test('Story Beat Next or Skip control sits above the writing box', async ({ page }) => {
  await page.goto('/submit');
  await page.getByRole('radio', { name: /Mixed Ending/i }).click();
  await expect(page).toHaveURL(/\/submit\/scene$/);

  await page.getByLabel(/Company · required/i).fill('Northstar Technologies');
  await page.getByLabel(/Location · required/i).fill('Bengaluru, India');
  await page.getByRole('button', { name: 'Next →' }).click();
  await expect(page).toHaveURL(/\/submit\/story\?beat=0$/);

  const writingBox = page.getByLabel('Your experience');
  const forward = page.getByRole('button', { name: /Skip for now →|Next →/ });
  await expect(writingBox).toBeVisible();
  await expect(forward).toBeVisible();

  const writingBoxPosition = await writingBox.boundingBox();
  const forwardPosition = await forward.boundingBox();
  expect(writingBoxPosition).not.toBeNull();
  expect(forwardPosition).not.toBeNull();
  expect(forwardPosition!.y + forwardPosition!.height).toBeLessThan(writingBoxPosition!.y);
});
