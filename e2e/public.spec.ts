import { expect, test } from '@playwright/test';

test.describe('Contribution journey', () => {
  test('an ending card automatically opens Set the Scene without authentication', async ({ page }) => {
    await page.goto('/submit');
    await expect(page.getByRole('heading', { name: 'How did this ending feel?' })).toBeVisible();
    await expect(page.locator('.career-jarvis')).toHaveCount(0);

    const breakFree = page.getByRole('radio', { name: /Break Free/i });
    await breakFree.click();

    await expect(page).toHaveURL(/\/submit\/scene$/);
    await expect(page.getByRole('heading', { name: 'Where did this story unfold?' })).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('Set the Scene leads into linear Story Beats and AI appears only when chosen', async ({ page }) => {
    await page.goto('/submit');
    await page.getByRole('radio', { name: /Mixed Ending/i }).click();
    await expect(page).toHaveURL(/\/submit\/scene$/);

    await page.getByLabel(/Company · required/i).fill('Northstar Technologies');
    await page.getByLabel(/Location · required/i).fill('Bengaluru, India');
    await page.getByRole('button', { name: 'Next →' }).click();

    await expect(page).toHaveURL(/\/submit\/story\?beat=0$/);
    await expect(page.getByText('The Beginning', { exact: true })).toBeVisible();
    await expect(page.getByText(/Technology \/ AI follow-up/i)).toHaveCount(0);
    await page.getByLabel('Your experience').fill('I joined for the role scope and the chance to learn from a strong team.');
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page).toHaveURL(/beat=1$/);

    await page.goto('/submit/story?beat=3');
    await expect(page.getByText('The Shift', { exact: true })).toBeVisible();
    await expect(page.getByText(/Technology \/ AI follow-up/i)).toHaveCount(0);
    await page.getByRole('button', { name: 'Technology / AI' }).click();
    await expect(page.getByText(/Technology \/ AI follow-up · optional/i)).toBeVisible();
  });

  test('Final Cut and Safety happen before the verification gate', async ({ page }) => {
    await page.goto('/submit');
    await page.getByRole('radio', { name: /Next Act/i }).click();
    await page.getByLabel(/Company · required/i).fill('Northstar Technologies');
    await page.getByLabel(/Location · required/i).fill('Remote — India');
    await page.getByRole('button', { name: 'Next →' }).click();

    for (let beat = 0; beat < 7; beat += 1) {
      await expect(page).toHaveURL(new RegExp(`beat=${beat}$`));
      const next = page.getByRole('button', { name: /Next →|Skip for now →/ });
      await next.click();
    }
    await expect(page).toHaveURL(/beat=7$/);
    await page.getByRole('button', { name: 'Review my story →' }).click();

    await expect(page).toHaveURL(/\/submit\/final-cut$/);
    await expect(page.getByRole('heading', { name: 'Read it as someone else will.' })).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
    await page.getByRole('button', { name: 'Run safety check →' }).click();

    await expect(page).toHaveURL(/\/submit\/safety$/);
    await expect(page.getByRole('heading', { name: 'A narrow screen. No opinion score.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify & submit →' })).toBeEnabled();
    await expect(page).not.toHaveURL(/\/login/);
  });
});

test('primary navigation reaches the next page without a blank state', async ({ page }) => {
  await page.goto('/more');
  await expect(page.getByRole('heading', { name: /Not a score\. A sequence\./i })).toBeVisible();
  await expect(page.locator('.career-jarvis')).toHaveCount(0);

  const privacyLink = page.locator('.cx-primary-nav').getByRole('link', { name: 'Privacy & Safety' });
  await privacyLink.click();

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { name: /Protected while you speak/i })).toBeVisible();
  await expect(page.locator('.site-header')).toHaveAttribute('data-route-pending', 'false');
});
