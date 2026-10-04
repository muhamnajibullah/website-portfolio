import { test, expect, type Page } from '@playwright/test';
import { auditAccessibility } from './accessibility';
import { editorialFixture } from './fixtures';
import { expectCenteredDialog } from './dialog';

async function mockEditorialContent(page: Page) {
  await page.route('**/content.json', (route) => route.fulfill({ json: editorialFixture }));
  await page.route('https://fixture.supabase.co/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#241d35"/><rect x="80" y="100" width="1040" height="600" rx="12" fill="#fff"/><rect x="100" y="130" width="220" height="540" fill="#e4dced"/><rect x="350" y="210" width="720" height="100" fill="#503b77"/><rect x="350" y="340" width="320" height="280" fill="#f4c5a4"/><rect x="700" y="340" width="370" height="280" fill="#a7cbd1"/><text x="350" y="175" font-family="Arial" font-size="26" fill="#241d35">BROWSER TEST IMAGE / NOT PORTFOLIO CONTENT</text></svg>',
    }),
  );
}

for (const width of [390, 820, 1440]) {
  test(`editorial showcase and case study retain content, imagery and accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockEditorialContent(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Software Engineer' })).toBeVisible();
    await expect(page.locator('.project-card')).toHaveCount(3);
    expect(
      await page
        .locator('main > section')
        .evaluateAll((sections) => sections.map((section) => section.id || 'hero')),
    ).toEqual(['hero', 'about', 'projects', 'experience', 'tools', 'mini-game', 'contact']);
    for (const theme of ['dark', 'light'] as const) {
      if (theme === 'light')
        await page.getByRole('button', { name: 'Switch to light mode' }).click();
      await expect(page.locator('.brand').first()).toHaveCSS(
        'color',
        theme === 'dark' ? 'rgb(243, 243, 240)' : 'rgb(16, 16, 16)',
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      for (const image of await page.locator('.portrait-frame img, .project-image img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
          .toBeGreaterThan(0);
        await expect(image).toHaveCSS('filter', 'none');
        await expect(image).toHaveCSS('mix-blend-mode', 'normal');
      }
      const first = page.locator('.project-card').first();
      await expect(
        first.getByText(editorialFixture.projects[0]!.challenges[0]!, { exact: true }),
      ).toBeVisible();
      await expect(
        first.getByText(editorialFixture.projects[0]!.solutions[0]!, { exact: true }),
      ).toBeVisible();
      await expect(first.getByText('Browser test tool', { exact: true })).toBeVisible();
      expect((await auditAccessibility(page)).violations).toEqual([]);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({
        path: `test-results/editorial-${theme}-${width}.png`,
        fullPage: true,
      });
    }
    await page.goto('/projects/synthetic-test-project');
    await expect(
      page.getByRole('heading', { level: 1, name: editorialFixture.projects[0]!.title }),
    ).toBeVisible();
    for (const title of [
      'Overview',
      'Problem',
      'Engineering approach',
      'Key features',
      'Technical challenges',
      'Solution',
      'Outcome',
    ])
      await expect(page.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible();
    await expect(
      page.getByText('<script>window.caseStudyXss = true</script>', { exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => 'caseStudyXss' in window)).toBe(false);
    await expect(page.locator('.project-gallery img')).toHaveAttribute(
      'alt',
      'Synthetic gallery fixture',
    );
    await expect(page.locator('.next-project a')).toHaveAttribute(
      'href',
      '/projects/second-browser-project',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect((await auditAccessibility(page)).violations).toEqual([]);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({
      path: `test-results/editorial-case-study-${width}.png`,
      fullPage: true,
    });
  });
}

test('mobile navigation supports keyboard, centered dialogs and scroll recovery', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockEditorialContent(page);
  await page.goto('/');
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    const trigger = page.getByRole('button', { name: 'Toggle navigation' });
    await trigger.click();
    const menu = page.getByRole('dialog', { name: 'Navigation', exact: true });
    await expectCenteredDialog(menu);
    await expect(menu.getByRole('button', { name: 'Close dialog' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: /projects/i })).toBeFocused();
    expect((await auditAccessibility(page)).violations).toEqual([]);
    await page.screenshot({ path: `test-results/editorial-menu-${width}.png` });
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await trigger.click();
    await menu.getByRole('button', { name: /mini game/i }).click();
    await expect(menu).toHaveCount(0);
    await expectCenteredDialog(page.getByRole('dialog', { name: 'Explore the portfolio in 3D' }));
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    await trigger.click();
    await menu.getByRole('link', { name: /experience/i }).click();
    await expect(menu).toHaveCount(0);
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.getByRole('heading', { name: 'Synthetic test organization' })).toBeVisible();
    await trigger.click();
    await page.setViewportSize({ width: 1440, height: 844 });
    await expect(menu).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  }
  await page.getByRole('button', { name: /mini game/i }).click();
  await expectCenteredDialog(page.getByRole('dialog', { name: 'Explore the portfolio in 3D' }));
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /mini game/i })).toBeFocused();
  await expect(page.locator('canvas')).toHaveCount(0);
});
