import { expect, test } from '@playwright/test';

const endings = [
  { slug: 'break-free', value: 'Break Free', headline: 'Relief can be part of the truth.', asset: 'card-1' },
  { slug: 'next-act', value: 'Next Act', headline: 'Sometimes moving on is simply the next chapter.', asset: 'card-2' },
  { slug: 'mixed-ending', value: 'Mixed Ending', headline: 'More than one thing can be true.', asset: 'card-3' },
  { slug: 'pass-the-torch', value: 'Pass the Torch', headline: 'Some chapters end with something worth passing on.', asset: 'card-5' },
];

test('homepage ending cards enter Set the Scene directly instead of browsing stories', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.cx-ending-grid .cx-ending-card');
  await expect(cards).toHaveCount(4);

  for (let index = 0; index < endings.length; index += 1) {
    await expect(cards.nth(index)).toHaveAttribute('href', `/submit/scene?ending=${endings[index].slug}&from=home`);
  }

  await cards.first().click();
  await expect(page).toHaveURL(/\/submit\/scene\?ending=break-free&from=home$/);
  await expect(page.getByRole('heading', { name: 'Set the Scene', exact: true })).toBeVisible();
  await expect(page.getByText('Relief can be part of the truth.', { exact: true })).toBeVisible();
  await expect(page.getByText('Loading stories')).toHaveCount(0);
});

test('Set the Scene uses ending-specific acknowledgment, art and draft state', async ({ page }) => {
  for (const ending of endings) {
    await page.goto(`/submit/scene?ending=${ending.slug}&from=home`);
    await expect(page.getByRole('heading', { name: 'Set the Scene', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Where did this story unfold?', exact: true })).toBeVisible();
    await expect(page.getByText(ending.headline, { exact: true })).toBeVisible();
    await expect(page.getByText(`You chose · ${ending.value}`, { exact: true })).toBeVisible();

    const art = page.locator('.cx-scene-entry__art');
    await expect(art).toBeVisible();
    const backgroundImage = await art.evaluate((node) => getComputedStyle(node).backgroundImage);
    expect(backgroundImage).toContain(`/frozen-assets/${ending.asset}`);

    const storedEnding = await page.evaluate(() => {
      const raw = localStorage.getItem('corporatex:contribution:v3');
      return raw ? JSON.parse(raw).ending : null;
    });
    expect(storedEnding).toBe(ending.value);
  }
});
