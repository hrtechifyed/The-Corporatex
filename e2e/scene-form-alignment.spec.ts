import { expect, test } from '@playwright/test';

test('Setting the Scene keeps paired fields aligned and uses the updated label', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/submit/scene?ending=break-free&from=home');

  await expect(page.locator('.cx-scene-page')).toBeVisible();

  const company = page.getByLabel(/Company · required/i);
  const location = page.getByLabel(/Location · required/i);
  const team = page.getByLabel(/Team or function · optional/i);
  const tenure = page.getByLabel(/Approximate tenure/i);

  const [companyBox, locationBox, teamBox, tenureBox] = await Promise.all([
    company.boundingBox(),
    location.boundingBox(),
    team.boundingBox(),
    tenure.boundingBox(),
  ]);

  expect(companyBox).not.toBeNull();
  expect(locationBox).not.toBeNull();
  expect(teamBox).not.toBeNull();
  expect(tenureBox).not.toBeNull();

  expect(Math.abs(companyBox!.y - locationBox!.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(teamBox!.y - tenureBox!.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(companyBox!.height - locationBox!.height)).toBeLessThanOrEqual(2);
  expect(Math.abs(teamBox!.height - tenureBox!.height)).toBeLessThanOrEqual(2);

  await expect(page.getByRole('heading', { name: 'Setting the Scene', exact: true })).toBeVisible();
  await expect(page.locator('.cx-flow-progress li').nth(1)).toContainText('Setting the Scene');
});
