import { expect, test } from '@playwright/test';

test.describe('Frozen homepage', () => {
  test('renders the approved anime-elegant composition with real interactive controls', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Not a score\./i })).toBeVisible();
    await expect(page.locator('.cx-frozen-sequence')).toBeVisible();
    await expect(page.locator('.cx-frozen-sequence')).toContainText('sequence');
    await expect(page.getByRole('link', { name: /Explore Stories/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Share Your Story/i }).first()).toBeVisible();
    await expect(page.locator('.cx-frozen-art')).toBeVisible();
    await expect(page.locator('.cx-frozen-card')).toHaveCount(5);
    await expect(page.locator('.cx-signal-visual')).toHaveCount(0);
    await expect(page.locator('.site-header')).toHaveAttribute('data-home', 'true');
    await expect(page.locator('.cx-brand').first()).toContainText('HRTechify');
    await expect(page.locator('.cx-brand').first()).toContainText('CorporateX');
  });

  test('serves the frozen artwork as cached WebP resources', async ({ request }) => {
    for (const asset of ['hero', 'card-1', 'card-2', 'card-3', 'card-4', 'card-5']) {
      const response = await request.get(`/frozen-assets/${asset}`);
      expect(response.ok()).toBeTruthy();
      expect(response.headers()['content-type']).toContain('image/webp');
      expect(response.headers()['cache-control']).toContain('immutable');
      expect((await response.body()).byteLength).toBeGreaterThan(1000);
    }
  });
});

test.describe('Global frozen design system', () => {
  for (const route of ['/browse', '/more', '/privacy', '/submit', '/login']) {
    test(`${route} keeps the same CorporateX header and footer language`, async ({ page }) => {
      await page.goto(route);
      const header = page.locator('.site-header');
      await expect(header).toBeVisible();
      await expect(header.locator('.cx-brand')).toContainText('HRTechify');
      await expect(header.locator('.cx-brand')).toContainText('CorporateX');
      await expect(header.getByRole('link', { name: 'Stories' })).toBeVisible();
      await expect(header.getByRole('link', { name: 'How It Works' })).toBeVisible();
      await expect(header.getByRole('link', { name: 'About' })).toBeVisible();
      await expect(header.getByRole('link', { name: 'Sign In' })).toBeVisible();

      const footer = page.locator('.site-footer');
      await expect(footer).toBeVisible();
      await expect(footer.locator('.cx-brand')).toContainText('HRTechify');
      await expect(footer.locator('.cx-brand')).toContainText('CorporateX');
      await expect(footer.getByRole('link', { name: 'Privacy & Safety' })).toBeVisible();
    });
  }

  test('More and Privacy use the approved anime art instead of the old abstract signal visual', async ({ page }) => {
    for (const route of ['/more', '/privacy']) {
      await page.goto(route);
      await expect(page.locator('.cx-frozen-mini-art')).toBeVisible();
      await expect(page.locator('.cx-signal-visual')).toHaveCount(0);
    }
  });
});

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

  const storiesLink = page.locator('.cx-primary-nav').getByRole('link', { name: 'Stories' });
  await storiesLink.click();

  await expect(page).toHaveURL(/\/browse$/);
  await expect(page.locator('.cx-archive-hero')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.cx-archive-hero .cx-display')).toContainText('Stories for the', { timeout: 15_000 });
  await expect(page.locator('.site-header')).toHaveAttribute('data-route-pending', 'false');
});
