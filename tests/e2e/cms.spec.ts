import { test, expect } from '@playwright/test';
import { fixture } from './fixtures';
import type { Content } from '../../packages/types/src';
test('CMS signs in, validates, creates a draft and previews safely using mocked transport', async ({
  page,
}) => {
  const content: Content = structuredClone(fixture);
  const payloads: unknown[] = [];
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
    return route.fulfill({ status: 204 });
  });
  await page.goto('http://127.0.0.1:5175');
  await page.getByLabel('Email address').fill('admin@example.test');
  await page.getByLabel('Password', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Make your story your own.' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'CMS sections' })
    .getByRole('button', { name: /^Projects/ })
    .click();
  await page.getByRole('button', { name: 'New record' }).click();
  await page.getByLabel('Title', { exact: true }).fill('Synthetic CMS test draft');
  await page.getByLabel('Slug', { exact: true }).fill('synthetic-cms-test-draft');
  await page.getByLabel('Live url', { exact: true }).fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(payloads).toHaveLength(0);
  await page.getByLabel('Live url', { exact: true }).fill('');
  await page.getByLabel('Description', { exact: true }).fill('<script>alert(1)</script>');
  await page.getByLabel('Project problems', { exact: true }).fill('Synthetic CMS problem.');
  await page.getByLabel('Solutions provided', { exact: true }).fill('Synthetic CMS solution.');
  await page.getByRole('button', { name: 'Preview draft' }).click();
  await expect(page.getByText('<script>alert(1)</script>', { exact: true })).toBeVisible();
  await expect(page.getByText('Synthetic CMS problem.', { exact: true })).toBeVisible();
  await expect(page.getByText('Synthetic CMS solution.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit content' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Synthetic CMS test draft' })).toBeVisible();
  expect(payloads[0]).toMatchObject({
    status: 'draft',
    title: 'Synthetic CMS test draft',
    challenges: ['Synthetic CMS problem.'],
    solutions: ['Synthetic CMS solution.'],
  });
});
