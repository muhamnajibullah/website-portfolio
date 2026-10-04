import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fixture } from './fixtures';

for (const width of [360, 390, 430, 768, 820, 1024, 1366, 1440, 1920, 2560, 3840]) {
  test(`normal mode has no overflow at ${width}px with placeholder and published content`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByText('Profile content placeholder')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(await page.locator('canvas').count()).toBe(0);
    await page.route('**/content.json', (route) => route.fulfill({ json: fixture }));
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Synthetic browser test project' }),
    ).toBeVisible();
    const card = page.locator('.project-card');
    await expect(
      card.getByText(fixture.projects[0]!.challenges[0]!, { exact: true }),
    ).toBeVisible();
    await expect(card.getByText(fixture.projects[0]!.solutions[0]!, { exact: true })).toBeVisible();
    await expect(card.getByText('Browser test tool', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(await page.locator('canvas').count()).toBe(0);
    if ([360, 768, 1440].includes(width))
      await page.screenshot({ path: `test-results/portfolio-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if ([360, 768, 1440].includes(width))
      await page.screenshot({ path: `test-results/portfolio-light-${width}.png`, fullPage: true });
  });
}
test('Three.js loads after Enter World; controls, proximity, details and exit work', async ({
  page,
}) => {
  const scripts: string[] = [],
    errors: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.js')) scripts.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/content.json', (route) => route.fulfill({ json: fixture }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Synthetic browser test project' })).toBeVisible();
  expect(scripts.some((url) => /InteractiveWorld|three/i.test(url))).toBe(false);
  await page.getByRole('button', { name: 'Explore interactive world', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Explore my interactive portfolio' }),
  ).toBeVisible();
  expect(scripts.some((url) => /InteractiveWorld|three/i.test(url))).toBe(false);
  await page.getByRole('button', { name: 'Enter world' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Graphics quality').selectOption('low');
  await page.getByRole('button', { name: 'Continue exploring' }).click();
  const openDetails = page.getByRole('button', { name: 'Open details' });
  // Short real-keyboard inputs avoid flying through the entire zone during slow software WebGL assertions.
  for (let attempt = 0; attempt < 12 && !(await openDetails.isEnabled()); attempt++) {
    await page.keyboard.press('w', { delay: 200 });
    await expect
      .poll(
        async () =>
          JSON.parse((await page.locator('canvas').getAttribute('data-flight')) ?? '{}').forward,
      )
      .toBe(0);
  }
  await expect(openDetails).toBeEnabled();
  await page.keyboard.press('e');
  await expect(page.getByRole('dialog', { name: 'Synthetic browser test project' })).toBeVisible();
  const pointCard = page.locator('.point-label');
  await expect(pointCard.getByText(fixture.projects[0]!.summary, { exact: true })).toBeVisible();
  await expect(pointCard.getByText('Browser test tool', { exact: true })).toBeVisible();
  const details = page.getByRole('dialog', { name: 'Synthetic browser test project' });
  for (const value of [...fixture.projects[0]!.challenges, ...fixture.projects[0]!.solutions])
    await expect(details.getByText(value, { exact: true })).toBeVisible();
  await expect(details.getByText('Browser test tool', { exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/project-details-desktop.png' });
  await expect(page.getByRole('link', { name: 'View full project' })).toHaveAttribute(
    'href',
    '/projects/synthetic-test-project',
  );
  await page.getByRole('button', { name: 'Continue exploring' }).click();
  await page.getByRole('button', { name: 'Reset flight' }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Graphics quality').selectOption('low');
  await page.getByRole('button', { name: 'Continue exploring' }).click();
  await page.getByRole('button', { name: 'Normal Mode', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Explore interactive world', exact: true }),
  ).toBeFocused();
  expect(errors).toEqual([]);
});
for (const viewport of [
  { width: 390, height: 844 },
  { width: 820, height: 1180 },
  { width: 1180, height: 820 },
]) {
  test(`touch joystick and altitude controls operate at ${viewport.width}×${viewport.height}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport,
      hasTouch: true,
      isMobile: viewport.width < 600,
    });
    try {
      const page = await context.newPage();
      await page.route('**/content.json', (route) => route.fulfill({ json: fixture }));
      await page.goto('http://127.0.0.1:4173');
      await expect(
        page.getByRole('heading', { name: 'Synthetic browser test project' }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Explore interactive world', exact: true }).click();
      await page.getByRole('button', { name: 'Enter world' }).click();
      await expect(page.locator('canvas')).toBeVisible();
      await page.getByRole('button', { name: 'Settings', exact: true }).tap();
      await page.getByLabel('Graphics quality').selectOption('low');
      await page.getByRole('button', { name: 'Continue exploring' }).tap();
      const joystick = await page.locator('.joystick').boundingBox();
      if (!joystick) throw new Error('Joystick missing');
      const touch = await context.newCDPSession(page);
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        // A gentle approach avoids crossing the interaction radius between emulator assertions.
        touchPoints: [
          { x: joystick.x + joystick.width / 2, y: joystick.y + joystick.height / 2 - 10 },
        ],
      });
      await expect(page.getByRole('button', { name: 'Open details' })).toBeEnabled();
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect
        .poll(
          async () =>
            JSON.parse((await page.locator('canvas').getAttribute('data-flight')) ?? '{}').forward,
        )
        .toBe(0);
      await page.getByRole('button', { name: 'Open details' }).tap();
      await expect(
        page.getByRole('dialog', { name: 'Synthetic browser test project' }),
      ).toBeVisible();
      const details = page.getByRole('dialog', { name: 'Synthetic browser test project' });
      await expect(
        details.getByText(fixture.projects[0]!.challenges[0]!, { exact: true }),
      ).toBeVisible();
      await expect(
        details.getByText(fixture.projects[0]!.solutions[0]!, { exact: true }),
      ).toBeVisible();
      expect(await details.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true,
      );
      await page.screenshot({ path: `test-results/project-details-touch-${viewport.width}.png` });
      await page.getByRole('button', { name: 'Continue exploring' }).tap();
      const altitude = await page.getByRole('button', { name: 'Ascend helicopter' }).boundingBox();
      if (!altitude) throw new Error('Altitude control missing');
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: altitude.x + altitude.width / 2, y: altitude.y + altitude.height / 2 }],
      });
      await expect
        .poll(
          async () =>
            JSON.parse((await page.locator('canvas').getAttribute('data-flight')) ?? '{}').position
              ?.y,
        )
        .toBeGreaterThan(3.1);
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.getByRole('button', { name: 'Reset flight' }).tap();
      await page.getByRole('button', { name: 'Normal Mode', exact: true }).tap();
      await expect(page.locator('canvas')).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Explore interactive world', exact: true }),
      ).toBeFocused();
      const scrollBefore = await page.evaluate(() => scrollY);
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: viewport.width / 2, y: viewport.height * 0.75 }],
      });
      for (const fraction of [0.65, 0.55, 0.45])
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: viewport.width / 2, y: viewport.height * fraction }],
        });
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 50);
    } finally {
      await context.close();
    }
  });
}
test('WebGL failure gracefully returns to the normal portfolio', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore interactive world', exact: true }).click();
  await page.getByRole('button', { name: 'Enter world' }).click();
  await expect(page.getByText('Interactive experience couldn’t be loaded.')).toBeVisible();
  await page.getByRole('button', { name: 'View Normal Portfolio' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
test('normal mode, intro and CMS setup meet basic WCAG checks', async ({ page }) => {
  await page.goto('/');
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole('button', { name: 'Explore interactive world', exact: true }).click();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await page.goto('http://127.0.0.1:4174');
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
});
test('CMS content is rendered as text and project pages retain stable URLs', async ({ page }) => {
  await page.route('**/content.json', (route) => route.fulfill({ json: fixture }));
  await page.goto('/projects/synthetic-test-project');
  await expect(
    page.getByRole('heading', { name: 'Synthetic browser test project', level: 1 }),
  ).toBeVisible();
  await expect(page.getByText('<img src=x onerror=alert(1)>', { exact: true })).toBeVisible();
  for (const value of [...fixture.projects[0]!.challenges, ...fixture.projects[0]!.solutions])
    await expect(page.getByText(value, { exact: true })).toBeVisible();
  expect(await page.locator('img[onerror]').count()).toBe(0);
  await expect(page).toHaveTitle(/Synthetic browser test project/);
});
