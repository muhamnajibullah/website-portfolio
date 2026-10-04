import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

export async function auditAccessibility(page: Page, tags?: string[]) {
  await page.locator('h1').first().waitFor({ state: 'visible' });
  // Audit fully displayed UI. Opacity entrances can temporarily lower composited contrast.
  await page.evaluate(async () => {
    const finiteAnimations = document.getAnimations().filter((animation) => {
      const endTime = animation.effect?.getComputedTiming().endTime;
      return typeof endTime === 'number' && Number.isFinite(endTime);
    });
    // A cancelled animation no longer affects the displayed UI.
    await Promise.all(finiteAnimations.map((animation) => animation.finished.catch(() => null)));
  });
  const builder = new AxeBuilder({ page });
  return (tags ? builder.withTags(tags) : builder).analyze();
}
