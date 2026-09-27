import { test, expect } from '@playwright/test';

// Foundation smoke test. Extended with progress/input/fallback/reduced-motion
// coverage in the testing phase.
test('page loads with expected title and no uncaught errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await expect(page).toHaveTitle(/Meridian/);
  await expect(page.getByRole('heading', { name: 'Meridian' })).toBeVisible();
  expect(errors).toEqual([]);
});
