import { test, expect, type Page } from '@playwright/test';

// Foundation smoke tests. Extended with progress/input/reduced-motion
// coverage in the testing phase.
async function progressValue(page: Page): Promise<number> {
  const raw = await page.getByRole('progressbar').getAttribute('aria-valuenow');
  return Number(raw ?? '0');
}
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

test('wheel input advances progress without scrolling the page', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await expect(page.locator('.experience canvas')).toBeVisible();
  // A real scroll gesture is many small events; Playwright sends one per call.
  for (let i = 0; i < 8; i += 1) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(60);
  }
  await expect.poll(() => progressValue(page), { timeout: 5000 }).toBeGreaterThanOrEqual(10);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(errors).toEqual([]);
});

test('keyboard End and Home reach the journey ends predictably', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await expect(page.locator('.experience canvas')).toBeVisible();
  await page.keyboard.press('End');
  await expect.poll(() => progressValue(page), { timeout: 8000 }).toBe(100);
  await page.keyboard.press('Home');
  await expect.poll(() => progressValue(page), { timeout: 8000 }).toBe(0);
  expect(errors).toEqual([]);
});

test('a single giant wheel spike cannot jump the journey', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await expect(page.locator('.experience canvas')).toBeVisible();
  await page.evaluate(() => {
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100000, cancelable: true }));
  });
  await page.waitForTimeout(1500);
  // Per-event clamp allows ~4% per spike: anything far above proves a jump.
  expect(await progressValue(page)).toBeLessThanOrEqual(12);
  expect(errors).toEqual([]);
});

test('camera modes render along the route without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  for (const progress of ['0.35', '0.55', '0.9']) {
    await page.goto(`/?progress=${progress}`);
    await expect(page.locator('.experience canvas')).toBeVisible();
  }
  expect(errors).toEqual([]);
});
