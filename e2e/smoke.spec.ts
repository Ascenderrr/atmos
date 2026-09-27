import { test, expect } from '@playwright/test';

// Foundation smoke tests. Extended with progress/input/reduced-motion
// coverage in the testing phase.
test('page loads with expected title and no uncaught errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await expect(page).toHaveTitle(/Meridian/);
  // The R3F Canvas mounts a WebGL canvas (SwiftShader in headless Chromium).
  await expect(page.locator('.experience canvas')).toBeVisible();
  expect(errors).toEqual([]);
});

test('?forceFallback=1 renders the static fallback with core content', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/?forceFallback=1');
  await expect(page.getByRole('heading', { name: 'Meridian' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Arrival' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('?progress=0&showPath=1 renders the aircraft on the debug path', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/?progress=0&showPath=1');
  await expect(page.locator('.experience canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
