import { expect, test } from '@playwright/test';

test.describe('Opening Signal journey', () => {
  test('selecting an ending gives immediate feedback and advances to Set the Scene', async ({ page }) => {
    await page.goto('/submit');

    await expect(page.getByRole('heading', { name: /Begin with the ending/i })).toBeVisible();

    const breakFree = page.getByRole('radio', { name: /Break Free/i });
    await breakFree.check();

    await expect(breakFree).toBeChecked();
    await expect(page.locator('.cx-ending-choice[data-ending="break-free"]')).toHaveAttribute(
      'data-selected',
      'true',
    );

    const confirmation = page.locator('.cx-opening-signal__confirmation');
    await expect(confirmation).toHaveAttribute('data-visible', 'true');
    await expect(confirmation).toContainText('Break Free');

    const jarvis = page.locator('.cx-opening-signal__jarvis');
    await expect(jarvis).toHaveAttribute('data-pose', 'pointing');
    await expect(jarvis).toHaveAttribute('data-tone', 'break-free');

    const continueButton = page.getByRole('button', { name: /Continue to Set the Scene/i });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    const companyField = page.getByLabel(/Company · required/i);
    await expect(page.locator('#set-the-scene')).toBeInViewport();
    await expect(companyField).toBeFocused();
  });

  test('ending choices remain keyboard operable', async ({ page }) => {
    await page.goto('/submit');

    const nextAct = page.getByRole('radio', { name: /Next Act/i });
    await nextAct.focus();
    await page.keyboard.press('Space');

    await expect(nextAct).toBeChecked();
    await expect(page.locator('.cx-opening-signal__jarvis')).toHaveAttribute('data-tone', 'next-act');
  });
});

test('primary navigation reaches the next page without a blank state', async ({ page }) => {
  await page.goto('/more');
  await expect(page.getByRole('heading', { name: /Not a score\. A sequence\./i })).toBeVisible();

  const privacyLink = page.locator('.cx-primary-nav').getByRole('link', { name: 'Privacy & Safety' });
  await privacyLink.click();

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { name: /Protected while you speak/i })).toBeVisible();
  await expect(page.locator('.site-header')).toHaveAttribute('data-route-pending', 'false');
});
