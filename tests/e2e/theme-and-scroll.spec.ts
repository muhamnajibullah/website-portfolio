import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fixture } from './fixtures';
import { expectCenteredDialog } from './dialog';

test('saved theme colors the prerendered page before React loads', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'light'));
  await page.route('**/assets/index-*.js', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(245, 245, 241)');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
});

for (const width of [390, 1440]) {
  test(`world exit restores scrolling, position and the actual trigger at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const trigger = page.getByRole('button', {
      name: 'Start the 3D tour',
      exact: true,
    });
    await trigger.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    });
    if (width === 1440)
      await page.evaluate(() => {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'scroll';
      });
    const before = await page.evaluate(() => ({
      y: scrollY,
      body: document.body.style.overflow,
      root: document.documentElement.style.overflow,
    }));
    expect(before.y).toBeGreaterThan(400);
    for (const exit of ['cancel', 'button', 'escape']) {
      await trigger.click();
      if (exit === 'cancel')
        await page.getByRole('button', { name: 'Stay on the portfolio' }).click();
      else {
        await page.getByRole('button', { name: 'Enter world' }).click();
        await expect(page.locator('canvas')).toBeVisible();
        await page.getByRole('button', { name: 'Settings', exact: true }).click();
        await page.keyboard.press('Escape');
        // A nested dialog releases only its own lock; the world still owns one.
        expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
        if (exit === 'button')
          await page.getByRole('button', { name: 'Back to portfolio', exact: true }).click();
        else await page.keyboard.press('Escape');
      }
      await expect(trigger).toBeFocused();
      await expect(page.locator('canvas')).toHaveCount(0);
      await expect
        .poll(() =>
          page.evaluate(() => ({
            y: scrollY,
            body: document.body.style.overflow,
            root: document.documentElement.style.overflow,
          })),
        )
        .toEqual(before);
      await page.mouse.move(width / 2, 400);
      await page.mouse.wheel(0, -250);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(before.y - 100);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), before.y);
    }
  });
}

for (const theme of ['dark', 'light'] as const) {
  test(`${theme} theme is persistent, readable and consistent across public, details, world and CMS`, async ({
    page,
  }) => {
    await page.route('**/content.json', (route) => route.fulfill({ json: fixture }));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(
      page.getByRole('heading', { name: 'Synthetic browser test project' }),
    ).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/portfolio-${theme}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Explore in 3D', exact: true }).click();
    await expectCenteredDialog(page.getByRole('dialog'));
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByRole('button', { name: 'Enter world' }).click();
    await expect(page.locator('canvas')).toBeVisible();
    await page.screenshot({ path: `test-results/world-${theme}.png` });
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page
      .getByRole('dialog', { name: 'Flight settings', exact: true })
      .getByRole('button', {
        name: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
      })
      .click();
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      theme === 'dark' ? 'light' : 'dark',
    );
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Back to portfolio', exact: true }).click();
    await expect(
      page.getByRole('button', {
        name: theme === 'dark' ? 'Switch to dark mode' : 'Switch to light mode',
      }),
    ).toBeVisible();
    await page
      .getByRole('button', {
        name: theme === 'dark' ? 'Switch to dark mode' : 'Switch to light mode',
      })
      .click();
    await page.goto('/projects/synthetic-test-project');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.goto('http://127.0.0.1:4174');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/cms-${theme}.png`, fullPage: true });
  });
}

test('blocked storage and reduced motion preserve usable theme switching and scroll recovery', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked');
    };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const trigger = page.getByRole('button', { name: 'Explore in 3D', exact: true });
  await trigger.hover();
  expect(await trigger.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
