import { expect, test, type Page } from '@playwright/test';

async function mockValidPlace(page: Page) {
  await page.route('**/api/location/validate?**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, matchedName: 'Bengaluru, Karnataka, India' }) });
  });
}

async function completeRequiredSceneContext(page: Page, location = 'Bengaluru, India') {
  await page.getByLabel(/Company · required/i).fill('Northstar Technologies');
  await page.getByLabel(/Location · required/i).fill(location);
  await page.getByLabel(/Approximate tenure · required/i).selectOption({ label: '1–2 years' });
  await page.getByLabel(/Work arrangement · required/i).selectOption({ label: 'Hybrid' });
}

test.describe('Frozen homepage', () => {
  test('renders the approved anime-elegant composition with an honest archive state', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Not a score\./i })).toBeVisible();
    await expect(page.locator('#pages-home-title em')).toContainText('sequence');
    await expect(page.getByRole('link', { name: /Explore Stories/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Share Your Story/i }).first()).toBeVisible();
    await expect(page.locator('.pages-hero-art')).toBeVisible();
    await expect(page.locator('.pages-story-card--forming')).toBeVisible();
    await expect(page.locator('.cx-signal-visual')).toHaveCount(0);
    await expect(page.locator('.pages-header')).toBeVisible();
    await expect(page.locator('.pages-brand').first()).toContainText('HRTechify');
    await expect(page.locator('.pages-brand').first()).toContainText('CorporateX');
    await expect(page.locator('#live-signals')).toBeVisible();
    await expect(page.getByText('Live · pending content validation')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Feedback' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Space' }).first()).toBeVisible();
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
      await expect(footer.getByRole('link', { name: 'Privacy & Safety' })).toBeVisible();
      await expect(footer.locator('.cx-footer-brand p')).toContainText('Workplace stories, structured for better career decisions.');
      await expect(footer.locator('.cx-footer-bottom span').first()).toContainText('© 2026 HRTechify. All rights reserved.');
      await expect(footer.locator('.cx-footer-bottom span').nth(1)).toContainText('Contributor stories reflect individual perspectives and are moderated before publication.');
    });
  }

  test('More and Privacy use the approved anime art instead of the old abstract signal visual', async ({ page }) => {
    for (const route of ['/more', '/privacy']) {
      await page.goto(route);
      await expect(page.locator('.cx-frozen-mini-art')).toBeVisible();
      await expect(page.locator('.cx-signal-visual')).toHaveCount(0);
    }
  });

  test('About stays inside the desktop viewport and loads frozen artwork', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about');
    const title = page.getByRole('heading', { name: /Workplace truth has a timeline/i });
    await expect(title).toBeVisible();
    await expect(page.locator('.cx-about-card-art--experience')).toBeVisible();
    const bounds = await page.evaluate(() => {
      const heading = document.querySelector('#about-title')?.getBoundingClientRect();
      const stage = document.querySelector('.cx-about-stage--deck')?.getBoundingClientRect();
      return { headingLeft: heading?.left ?? -1, stageRight: stage?.right ?? 99999, viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth };
    });
    expect(bounds.headingLeft).toBeGreaterThanOrEqual(20);
    expect(bounds.stageRight).toBeLessThanOrEqual(bounds.viewport + 1);
    expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.viewport + 1);
    const artImage = await page.locator('.cx-about-card-art--experience').evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(artImage).toContain('/frozen-assets/card-1');
    expect(artImage).not.toContain('card-1.webp');
  });

  test('How It Works cards are compact, illustrated and not blank containers', async ({ page }) => {
    await page.goto('/more#how-it-works');
    const cards = page.locator('.cx-feature-card--illustrated');
    await expect(cards).toHaveCount(3);
    const heights = await cards.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
    for (const height of heights) expect(height).toBeGreaterThan(220);
    for (const height of heights) expect(height).toBeLessThan(520);
    for (const scene of ['signal', 'sequence', 'decision']) await expect(page.locator(`.cx-feature-card__art[data-scene="${scene}"]`)).toBeVisible();
  });
});

test.describe('Contribution journey', () => {
  test('an ending card automatically opens Setting the Scene without authentication', async ({ page }) => {
    await page.goto('/submit');
    await expect(page.getByRole('heading', { name: 'How did this ending feel?' })).toBeVisible();
    await expect(page.getByText('About 8–12 minutes for most contributors.')).toBeVisible();
    await page.getByRole('radio', { name: /Break Free/i }).click();
    await expect(page).toHaveURL(/\/submit\/scene$/);
    await expect(page.getByRole('heading', { name: 'Where did this story unfold?' })).toBeVisible();
    await expect(page.getByText('Setting the Scene', { exact: true }).first()).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('Setting the Scene requires deliberate tenure and arrangement selection', async ({ page }) => {
    await mockValidPlace(page);
    await page.goto('/submit');
    await page.getByRole('radio', { name: /Mixed Ending/i }).click();
    await page.getByLabel(/Company · required/i).fill('Northstar Technologies');
    await page.getByLabel(/Location · required/i).fill('Bengaluru, India');
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page.locator('.cx-flow-error')).toContainText('Choose an approximate tenure');
    await page.getByLabel(/Approximate tenure · required/i).selectOption({ label: '1–2 years' });
    await page.getByLabel(/Work arrangement · required/i).selectOption({ label: 'Hybrid' });
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page).toHaveURL(/\/submit\/story\?beat=0$/);
  });

  test('Setting the Scene leads into linear Story Beats and AI appears only when chosen', async ({ page }) => {
    await mockValidPlace(page);
    await page.goto('/submit');
    await page.getByRole('radio', { name: /Mixed Ending/i }).click();
    await completeRequiredSceneContext(page);
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page).toHaveURL(/\/submit\/story\?beat=0$/);
    await expect(page.getByText('The Beginning', { exact: true })).toBeVisible();
    await page.getByLabel('Your experience').fill('I joined for the role scope and the chance to learn from a strong team.');
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page).toHaveURL(/beat=1$/);
    await page.goto('/submit/story?beat=3');
    await expect(page.getByText('The Shift', { exact: true })).toBeVisible();
    await expect(page.getByText(/Technology \/ AI follow-up/i)).toHaveCount(0);
    await page.getByRole('button', { name: 'Technology / AI' }).click();
    await expect(page.getByText(/Technology \/ AI follow-up · optional/i)).toBeVisible();
  });

  test('Setting the Scene blocks an invalid place but allows a service-outage fallback', async ({ page }) => {
    await page.route('**/api/location/validate?**', async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.get('q') === 'not-a-place') await route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ valid: false, error: 'We could not verify that location. Use a city, region or country.' }) });
      else await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Place service unavailable' }) });
    });
    await page.goto('/submit');
    await page.getByRole('radio', { name: /Break Free/i }).click();
    await completeRequiredSceneContext(page, 'not-a-place');
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page.locator('.cx-flow-error')).toContainText('could not verify');
    await page.getByLabel(/Location · required/i).fill('Bengaluru, India');
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page.getByRole('button', { name: 'Continue with this location' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue with this location' }).click();
    await expect(page).toHaveURL(/\/submit\/story\?beat=0$/);
  });

  test('Final Cut requires substantive contributor wording before Safety', async ({ page }) => {
    await mockValidPlace(page);
    await page.goto('/submit');
    await page.getByRole('radio', { name: /Next Act/i }).click();
    await completeRequiredSceneContext(page);
    await page.getByRole('button', { name: 'Next →' }).click();
    await page.getByLabel('Your experience').fill('I joined because the role offered meaningful learning, supportive colleagues, and scope that matched what I wanted next.');
    for (let beat = 0; beat < 7; beat += 1) {
      await expect(page).toHaveURL(new RegExp(`beat=${beat}$`));
      await page.getByRole('button', { name: /Next →|Skip for now →/ }).click();
    }
    await expect(page).toHaveURL(/beat=7$/);
    await page.getByRole('button', { name: 'Review my story →' }).click();
    await expect(page).toHaveURL(/\/submit\/final-cut$/);
    await page.getByRole('button', { name: 'Run safety check →' }).click();
    await expect(page).toHaveURL(/\/submit\/safety$/);
    await expect(page.getByRole('heading', { name: 'A narrow screen. No opinion score.' })).toBeVisible();
    await expect(page.getByText(/It does not detect every identifying clue/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify & submit →' })).toBeEnabled();
  });
});

test('primary navigation reaches Stories without a blank state', async ({ page }) => {
  await page.goto('/more');
  const storiesLink = page.locator('.cx-primary-nav').getByRole('link', { name: 'Stories' });
  await storiesLink.click();
  await expect(page).toHaveURL(/\/browse$/);
  await expect(page.locator('.cx-archive-hero')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.site-header')).toHaveAttribute('data-route-pending', 'false');
});
