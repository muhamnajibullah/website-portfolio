import { test, expect } from '@playwright/test';
import { auditAccessibility } from './accessibility';
import { fixture } from './fixtures';
import { expectCenteredDialog } from './dialog';
import type { Content } from '../../packages/types/src';
test('CMS validates drafts, previews safely and confirms deletion in centered dialogs', async ({
  page,
}) => {
  const content: Content = structuredClone(fixture);
  const payloads: unknown[] = [];
  const deletions: string[] = [];
  const user = {
    id: '00000000-0000-4000-8000-000000000010',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'admin@example.test',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    factors: [],
  };
  const token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600, aal: 'aal1', role: 'authenticated', amr: [{ method: 'password', timestamp: Math.floor(Date.now() / 1000) }] })).toString('base64url')}.${Buffer.from('test-only-signature').toString('base64url')}`;
  await page.route('http://127.0.0.1:54545/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (url.pathname.startsWith('/auth/v1/token'))
      return route.fulfill({
        json: {
          access_token: token,
          refresh_token: 'e2e-only-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user,
        },
      });
    if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user });
    if (url.pathname === '/rest/v1/rpc/is_admin') return route.fulfill({ json: true });
    const table = url.pathname.split('/').pop() as keyof Content;
    if (table in content && request.method() === 'GET')
      return route.fulfill({ json: content[table] });
    if (table in content && request.method() === 'POST') {
      const payload = request.postDataJSON();
      payloads.push(payload);
      if (table === 'projects') content.projects.push(payload);
      return route.fulfill({ status: 201, json: null });
    }
    if (table === 'projects' && request.method() === 'DELETE') {
      const id = url.searchParams.get('id')?.replace(/^eq\./, '') ?? '';
      deletions.push(id);
      content.projects = content.projects.filter((project) => project.id !== id);
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ status: 204 });
  });
  await page.goto('http://127.0.0.1:5175');
  await page.getByLabel('Email address').fill('admin@example.test');
  await page.getByLabel('Password', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Manage your portfolio.' })).toBeVisible();
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/cms-dashboard-dark.png' });
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  // Audit the completed theme, rather than an interpolated foreground mid-transition.
  await expect(page.locator('.cms-sidebar .brand')).toHaveCSS('color', 'rgb(16, 16, 16)');
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/cms-dashboard-light.png' });
  await page
    .getByRole('navigation', { name: 'CMS sections' })
    .getByRole('button', { name: /^Projects/ })
    .click();
  await page.getByRole('button', { name: 'Add item' }).click();
  for (const width of [360, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expectCenteredDialog(page.getByRole('dialog'));
    expect(
      await page
        .getByRole('dialog')
        .evaluate((element) => element.scrollHeight > element.clientHeight),
    ).toBe(true);
  }
  await page.screenshot({ path: 'test-results/cms-editor-centered.png' });
  await page.getByLabel('Title', { exact: true }).fill('Synthetic CMS test draft');
  await page.getByLabel('Project URL name', { exact: true }).fill('synthetic-cms-test-draft');
  await page.getByLabel('Live project URL', { exact: true }).fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(payloads).toHaveLength(0);
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('.cms-sidebar .brand')).toHaveCSS('color', 'rgb(243, 243, 240)');
  await page.getByRole('button', { name: 'Add item' }).click();
  // Reopen a fresh draft after the theme switch; validation still governs all writes.
  await page.getByLabel('Title', { exact: true }).fill('Synthetic CMS test draft');
  await page.getByLabel('Project URL name', { exact: true }).fill('synthetic-cms-test-draft');
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page.getByLabel('Live project URL', { exact: true }).fill('');
  await page.getByLabel('Full description', { exact: true }).fill('<script>alert(1)</script>');
  await page.getByLabel('Project problems', { exact: true }).fill('Synthetic CMS problem.');
  await page.getByLabel('Solutions provided', { exact: true }).fill('Synthetic CMS solution.');
  await page
    .getByLabel('Engineering approach', { exact: true })
    .fill('Synthetic CMS engineering approach.');
  await page.getByLabel('Key features', { exact: true }).fill('Synthetic CMS feature.');
  await page
    .getByLabel('Technical challenges', { exact: true })
    .fill('Synthetic CMS technical challenge.');
  await page.getByLabel('Project outcome', { exact: true }).fill('Synthetic CMS outcome.');
  await page.getByRole('button', { name: 'Preview draft' }).click();
  await expect(page.getByText('<script>alert(1)</script>', { exact: true })).toBeVisible();
  await expect(page.getByText('Synthetic CMS problem.', { exact: true })).toBeVisible();
  await expect(page.getByText('Synthetic CMS solution.', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Synthetic CMS engineering approach.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Synthetic CMS feature.', { exact: true })).toBeVisible();
  await expect(page.getByText('Synthetic CMS technical challenge.', { exact: true })).toBeVisible();
  await expect(page.getByText('Synthetic CMS outcome.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit content' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Synthetic CMS test draft' })).toBeVisible();
  expect(payloads[0]).toMatchObject({
    status: 'draft',
    title: 'Synthetic CMS test draft',
    challenges: ['Synthetic CMS problem.'],
    solutions: ['Synthetic CMS solution.'],
    engineering_approach: 'Synthetic CMS engineering approach.',
    key_features: ['Synthetic CMS feature.'],
    technical_challenges: ['Synthetic CMS technical challenge.'],
    outcome: 'Synthetic CMS outcome.',
  });
  const draft = page
    .locator('.record-row')
    .filter({ has: page.getByRole('heading', { name: 'Synthetic CMS test draft' }) });
  const deleteTrigger = draft.getByRole('button', { name: 'Delete', exact: true });
  await deleteTrigger.click();
  const confirmation = page.getByRole('dialog', { name: 'Delete this item?' });
  for (const width of [360, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expectCenteredDialog(confirmation);
  }
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/cms-delete-centered.png' });
  await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(deletions).toHaveLength(0);
  await expect(draft).toBeVisible();
  await expect(deleteTrigger).toBeFocused();
  await deleteTrigger.click();
  await confirmation.getByRole('button', { name: 'Delete item', exact: true }).click();
  await expect(confirmation).toHaveCount(0);
  await expect(draft).toHaveCount(0);
  expect(deletions).toHaveLength(1);
  expect(payloads[0]).toMatchObject({ id: deletions[0] });
  expect(content.projects).toHaveLength(1);
  expect(content.projects[0]!.id).toBe(fixture.projects[0]!.id);
});
