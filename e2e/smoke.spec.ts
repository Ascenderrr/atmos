import { test, expect, type Page } from '@playwright/test';

// Smoke suite: loading, state machine, inputs, fallback, typography, tiers.
// ?progress= boots straight into the active journey for deterministic tests.
async function progressValue(page: Page): Promise<number> {
  const raw = await page.getByRole('progressbar').getAttribute('aria-valuenow');
  return Number(raw ?? '0');
}

async function beginExperience(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin the flight' }).click();
  await expect(page.locator('.experience canvas')).toBeVisible();
}

test('page loads to the ready gate with no uncaught errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await expect(page).toHaveTitle(/Meridian/);
  await expect(page.getByRole('button', { name: 'Begin the flight' })).toBeVisible();
  await expect(page.locator('.experience canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('begin enters the journey; skip reaches the text version', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await page.getByRole('button', { name: 'Begin the flight' }).click();
  await expect(page.locator('.experience canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Skip animation and view text version' }).click();
  await expect(page.locator('.fallback-hero h1')).toHaveText('Meridian');
  await expect(page.locator('.experience canvas')).toHaveCount(0);
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('H1');
  expect(errors).toEqual([]);
});

test('reaching the end completes; replay restarts', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await beginExperience(page);
  await page.keyboard.press('End');
  await expect(page.getByRole('heading', { name: 'Arrived' })).toBeVisible({ timeout: 12000 });
  await page.getByRole('button', { name: 'Fly again' }).click();
  await expect(page.locator('.experience canvas')).toBeVisible();
  await expect.poll(() => progressValue(page), { timeout: 5000 }).toBe(0);
  expect(errors).toEqual([]);
});

test('zero-audio mode shows no sound control', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await beginExperience(page);
  await expect(page.getByRole('button', { name: 'Play music' })).toHaveCount(0);
  await expect(page.locator('.sound-toggle')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('?forceFallback=1 renders the static fallback with core content', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/?forceFallback=1');
  await expect(page.locator('.fallback-hero h1')).toHaveText('Meridian');
  await expect(page.getByRole('heading', { name: 'Crosswind' })).toBeVisible();
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

  await beginExperience(page);
  // A real scroll gesture is many small events; Playwright sends one per call.
  for (let i = 0; i < 8; i += 1) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(60);
  }
  await expect.poll(() => progressValue(page), { timeout: 5000 }).toBeGreaterThanOrEqual(10);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(errors).toEqual([]);
});

test('keyboard arrows travel both ways and clamp at the start', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await beginExperience(page);
  for (let i = 0; i < 4; i += 1) {
    await page.keyboard.press('ArrowDown');
  }
  await expect.poll(() => progressValue(page), { timeout: 8000 }).toBeGreaterThan(0);
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('ArrowUp');
  }
  await expect.poll(() => progressValue(page), { timeout: 8000 }).toBe(0);
  expect(errors).toEqual([]);
});

test('a single giant wheel spike cannot jump the journey', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await beginExperience(page);
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

test('quality tiers render without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  for (const quality of ['low', 'medium', 'high']) {
    await page.goto(`/?progress=0.4&quality=${quality}`);
    await expect(page.locator('.experience canvas')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

async function chapterOpacity(page: Page, chapter: string): Promise<number> {
  const value = await page.evaluate((id) => {
    const element = document.querySelector(`[data-chapter="${id}"]`);
    return element ? getComputedStyle(element).opacity : 'missing';
  }, chapter);
  return Number(value);
}

test('chapters fade in and out with progress', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/?progress=0.2');
  await expect.poll(() => chapterOpacity(page, 'takeoff'), { timeout: 5000 }).toBeGreaterThan(0.9);
  expect(await chapterOpacity(page, 'intro')).toBeLessThan(0.1);

  await page.goto('/?progress=0.57');
  await expect.poll(() => chapterOpacity(page, 'flight-2'), { timeout: 5000 }).toBeGreaterThan(0.9);
  expect(await chapterOpacity(page, 'takeoff')).toBeLessThan(0.1);
  expect(errors).toEqual([]);
});

test('decorative canvas is hidden from assistive technology', async ({ page }) => {
  await page.goto('/?progress=0');
  await expect(page.locator('.experience-canvas')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
});
