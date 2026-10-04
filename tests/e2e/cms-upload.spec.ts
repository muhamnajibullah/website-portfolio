import { test, expect, type Page } from '@playwright/test';
import type { Content, ContentRecord, TableName } from '../../packages/types/src';
import { fixture } from './fixtures';
import { auditAccessibility } from './accessibility';
import { expectCenteredDialog } from './dialog';

// All Auth, Database, and Storage requests stay inside this browser mock.
async function openCms(page: Page) {
  const encodedImages = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#101010';
    context.fillRect(0, 0, 640, 360);
    context.fillStyle = '#00d1d1';
    context.font = '32px sans-serif';
    context.fillText('Test-only image', 32, 80);
    return ['image/png', 'image/jpeg', 'image/webp'].map((type) => ({
      type,
      data: canvas.toDataURL(type).split(',')[1]!,
    }));
  });
  const images = encodedImages.map(({ type, data }) => ({
    name: `test-only-image.${type === 'image/jpeg' ? 'jpg' : type.split('/')[1]}`,
    mimeType: type,
    buffer: Buffer.from(data, 'base64'),
  }));
  const image = images[0]!;
  const state = {
    content: structuredClone(fixture) as Content,
    writes: [] as { table: TableName; value: ContentRecord }[],
    uploads: [] as { path: string; upsert: string | undefined }[],
    removed: [] as string[],
    failStorage: false,
    failMetadata: false,
    uploadGate: null as Promise<void> | null,
    image,
    images,
  };
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
  await page.route('https://fixture.supabase.co/**', (route) =>
    route.fulfill({ contentType: 'image/png', body: image.buffer }),
  );
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
    if (url.pathname.startsWith('/storage/v1/object/public/'))
      return route.fulfill({ contentType: 'image/png', body: image.buffer });
    if (
      url.pathname.startsWith('/storage/v1/object/public-media/') &&
      request.method() === 'POST'
    ) {
      const path = url.pathname.replace('/storage/v1/object/public-media/', '');
      state.uploads.push({ path, upsert: request.headers()['x-upsert'] });
      if (state.uploadGate) await state.uploadGate;
      if (state.failStorage)
        return route.fulfill({
          status: 403,
          json: { statusCode: '403', error: 'Unauthorized', message: 'Test-only denial' },
        });
      return route.fulfill({ json: { Id: path.split('/')[1], Key: `public-media/${path}` } });
    }
    if (url.pathname === '/storage/v1/object/public-media' && request.method() === 'DELETE') {
      state.removed.push(...request.postDataJSON().prefixes);
      return route.fulfill({ json: [] });
    }
    const table = url.pathname.split('/').pop() as TableName;
    if (table in state.content && request.method() === 'GET')
      return route.fulfill({ json: state.content[table] });
    if (table in state.content && request.method() === 'POST') {
      const value = request.postDataJSON() as ContentRecord;
      state.writes.push({ table, value });
      if (table === 'media_metadata' && state.failMetadata)
        return route.fulfill({ status: 403, json: { code: '42501', message: 'Test-only denial' } });
      const records: ContentRecord[] = state.content[table];
      const index = records.findIndex((record) => record.id === value.id);
      if (index < 0) records.push(value);
      else records[index] = value;
      return route.fulfill({ status: 201, json: null });
    }
    return route.fulfill({ status: 204 });
  });
  await page.goto('http://127.0.0.1:5175');
  await page.getByLabel('Email address').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Manage your portfolio.' })).toBeVisible();
  return state;
}

test('CMS uploads project images, fills dimensions, and keeps the draft unsaved until Save', async ({
  page,
}) => {
  const state = await openCms(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page
    .getByRole('navigation', { name: 'CMS sections' })
    .getByRole('button', { name: /^Projects/ })
    .click();
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.getByLabel('Title', { exact: true }).fill('Image upload test draft');
  await page.getByLabel('Project URL name').fill('image-upload-test-draft');
  await page.getByLabel('Image description (alt text)').fill('  Project test screenshot  ');
  await page.getByLabel('Image file').setInputFiles(state.image);
  await page.getByRole('button', { name: 'Upload image', exact: true }).click();
  await expect(page.getByLabel('Image URL', { exact: true })).toHaveValue(
    /\/storage\/v1\/object\/public\/public-media\/.*\.png$/,
  );
  await expect(page.getByLabel('Image description (alt text)')).toHaveValue(
    'Project test screenshot',
  );
  await expect(page.getByLabel('Image width (pixels)')).toHaveValue('640');
  await expect(page.getByLabel('Image height (pixels)')).toHaveValue('360');
  await expect(page.getByRole('img', { name: 'Project test screenshot' })).toBeVisible();
  expect(state.writes.map((write) => write.table)).toEqual(['media_metadata']);
  expect(state.writes[0]!.value).toMatchObject({
    status: 'draft',
    alt: 'Project test screenshot',
    width: 640,
    height: 360,
    mime_type: 'image/png',
    size_bytes: state.image.buffer.length,
  });
  expect(state.uploads[0]!.path).toMatch(
    /^00000000-0000-4000-8000-000000000010\/[a-f0-9-]{36}\.png$/,
  );
  expect(state.uploads[0]!.upsert).toBe('false');
  expect(state.uploads[0]!.path).not.toContain(state.image.name);
  expect(await page.locator('form form').count()).toBe(0);
  for (const width of [360, 390, 430, 768, 820, 1024, 1280, 1366, 1440, 1536, 1920, 2560, 3840]) {
    await page.setViewportSize({ width, height: 900 });
    const dialog = page.getByRole('dialog');
    await expectCenteredDialog(dialog);
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 360, height: 844 });
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page
    .locator('.image-upload fieldset')
    .evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: 'test-results/cms-upload-mobile-dark.png' });
  await page.getByRole('button', { name: 'Save changes' }).click();
  const draft = page
    .locator('.record-row')
    .filter({ has: page.getByRole('heading', { name: 'Image upload test draft' }) });
  await expect(draft).toBeVisible();
  expect(state.writes[1]!.value).toMatchObject({
    status: 'draft',
    image_url: state.content.media_metadata.at(-1)!.url,
    image_alt: 'Project test screenshot',
    image_width: 640,
    image_height: 360,
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('.cms-sidebar .brand')).toHaveCSS('color', 'rgb(16, 16, 16)');
  await draft.getByRole('button', { name: 'Edit item' }).click();
  expect((await auditAccessibility(page)).violations).toEqual([]);
  await page
    .locator('.image-upload fieldset')
    .evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: 'test-results/cms-upload-desktop-light.png' });
  expect(errors).toEqual([]);
});

test('CMS rejects unsafe files and recovers from Storage and metadata failures without replacing the image', async ({
  page,
}) => {
  const state = await openCms(page);
  await page
    .getByRole('navigation', { name: 'CMS sections' })
    .getByRole('button', { name: /^Projects/ })
    .click();
  await page.locator('.record-row').first().getByRole('button', { name: 'Edit item' }).click();
  const original = await page.getByLabel('Image URL', { exact: true }).inputValue();
  const width = await page.getByLabel('Image width (pixels)').inputValue();
  await page.getByLabel('Image description (alt text)').fill('Replacement test screenshot');
  const invalidFiles = [
    {
      file: { name: 'unsafe.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg></svg>') },
      error: /Only PNG, JPEG and WebP/,
    },
    {
      file: { name: 'oversized.png', mimeType: 'image/png', buffer: Buffer.alloc(5242881) },
      error: /between 1 byte and 5 MB/,
    },
    {
      file: { name: 'corrupt.png', mimeType: 'image/png', buffer: Buffer.from('not an image') },
      error: /Could not read this image/,
    },
    {
      file: { ...state.image, name: 'wrong-type.jpg', mimeType: 'image/jpeg' },
      error: /does not match its image type/,
    },
  ];
  for (const { file, error } of invalidFiles) {
    await page.getByLabel('Image file').setInputFiles(file);
    await page.getByRole('button', { name: 'Upload image', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText(error);
  }
  await page.getByLabel('Image description (alt text)').fill('');
  await page.getByLabel('Image file').setInputFiles(state.image);
  await page.getByRole('button', { name: 'Upload image', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(/Provide an image description/);
  expect(state.uploads).toHaveLength(0);
  expect(state.writes).toHaveLength(0);
  await page.getByLabel('Image description (alt text)').fill('Replacement test screenshot');
  state.failStorage = true;
  await page.getByRole('button', { name: 'Upload image', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Upload failed.');
  expect(state.writes).toHaveLength(0);
  await expect(page.getByLabel('Image URL', { exact: true })).toHaveValue(original);
  state.failStorage = false;
  state.failMetadata = true;
  await page.getByRole('button', { name: 'Upload image', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Save failed.');
  expect(state.removed).toEqual([state.uploads[1]!.path]);
  await expect(page.getByLabel('Image URL', { exact: true })).toHaveValue(original);
  await expect(page.getByLabel('Image width (pixels)')).toHaveValue(width);
  state.failMetadata = false;
  let releaseUpload = () => {};
  state.uploadGate = new Promise<void>((resolve) => {
    releaseUpload = resolve;
  });
  await page.getByRole('button', { name: 'Upload image', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Uploading…', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Preview draft' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  releaseUpload();
  await expect(page.getByLabel('Image URL', { exact: true })).not.toHaveValue(original);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled();
  expect(state.writes.every((write) => write.table === 'media_metadata')).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // Cancelling the edit keeps the original project; the uploaded asset stays in the library.
  expect(state.content.projects[0]!.image_url).toBe(original);
  await page
    .getByRole('navigation', { name: 'CMS sections' })
    .getByRole('button', { name: /^Media Library/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Replacement test screenshot', exact: true }),
  ).toBeVisible();
});

test('CMS uploads profile, experience, sharing, and gallery-library images', async ({ page }) => {
  const state = await openCms(page);
  for (const section of [
    {
      name: /^Profile/,
      table: 'profiles',
      fields: { Name: 'Test-only profile' },
      url: 'Image URL',
    },
    {
      name: /^Work experiences/,
      table: 'work_experiences',
      fields: { Organization: 'Test-only organization', Position: 'Software Engineer' },
      url: 'Image URL',
    },
    {
      name: /^Website settings/,
      table: 'site_settings',
      fields: { 'Site name': 'Test-only portfolio' },
      url: 'Social sharing image URL',
    },
  ]) {
    await page
      .getByRole('navigation', { name: 'CMS sections' })
      .getByRole('button', { name: section.name })
      .click();
    await page.getByRole('button', { name: 'Add item' }).click();
    for (const [field, value] of Object.entries(section.fields))
      await page.getByLabel(field, { exact: true }).fill(value);
    await page.getByLabel('Image description (alt text)').fill(`Test-only ${section.table} image`);
    await page.getByLabel('Image file').setInputFiles(state.image);
    await page.getByRole('button', { name: 'Upload image', exact: true }).click();
    await expect(page.getByLabel(section.url, { exact: true })).toHaveValue(
      /\/public-media\/.*\.png$/,
    );
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(
      state.writes.filter((write) => write.table === section.table).at(-1)!.value,
    ).toMatchObject({ status: 'draft' });
  }
  await page
    .getByRole('navigation', { name: 'CMS sections' })
    .getByRole('button', { name: /^Media Library/ })
    .click();
  for (const image of state.images) {
    await page
      .getByLabel('Image description (alt text)')
      .fill(`Test-only gallery ${image.mimeType}`);
    await page.getByLabel('Image file').setInputFiles(image);
    await page.getByRole('button', { name: 'Upload image', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: `Test-only gallery ${image.mimeType}`, exact: true }),
    ).toBeVisible();
    expect(state.content.media_metadata.at(-1)!).toMatchObject({
      alt: `Test-only gallery ${image.mimeType}`,
      width: 640,
      height: 360,
      mime_type: image.mimeType,
      status: 'draft',
    });
  }
  await expect(
    page.getByText('Saved to Media Library as a draft.', { exact: false }),
  ).toBeVisible();
  expect((await auditAccessibility(page)).violations).toEqual([]);
});
