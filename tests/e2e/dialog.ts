import { expect, type Locator } from '@playwright/test';

export async function expectCenteredDialog(dialog: Locator) {
  await expect(dialog).toBeVisible();
  // Allow the reserved scrollbar gutter horizontally and wait for entrance motion to settle.
  await expect
    .poll(() =>
      dialog.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return Math.max(
          Math.abs(bounds.x + bounds.width / 2 - innerWidth / 2) / 10,
          Math.abs(bounds.y + bounds.height / 2 - innerHeight / 2) / 2,
        );
      }),
    )
    .toBeLessThanOrEqual(1);
  expect(
    await dialog.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return (
        bounds.x >= 0 &&
        bounds.y >= 0 &&
        bounds.right <= innerWidth &&
        bounds.bottom <= innerHeight &&
        element.scrollWidth <= element.clientWidth
      );
    }),
  ).toBe(true);
}
