import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  contentSchema,
  tableSchemas,
  validatePublicKey,
  validateUpload,
} from '@portfolio/validation';
import type { Content, Database, TableName } from '@portfolio/types';

export function createPortfolioClient(
  url: string | undefined,
  key: string | undefined,
  admin = false,
) {
  if (!url || !key) return null;
  const parsed = new URL(url);
  if (
    parsed.protocol !== 'https:' &&
    !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname))
  ) {
    throw new Error('Supabase must use HTTPS (local development may use HTTP).');
  }
  validatePublicKey(key);
  return createClient<Database>(url, key, {
    auth: { persistSession: admin, autoRefreshToken: admin, detectSessionInUrl: false },
  });
}
export class PortfolioRepository {
  constructor(readonly client: SupabaseClient<Database>) {}

  async load(publicOnly = true): Promise<Content> {
    const entries = await Promise.all(
      Object.keys(tableSchemas).map(async (table) => {
        const query = this.client.from(table).select('*').order('sort_order').order('id');
        const { data, error } = await (publicOnly ? query.eq('status', 'published') : query);
        if (error) throw new Error('Content could not be loaded. Please try again.');
        return [table, data] as const;
      }),
    );
    return contentSchema.parse(Object.fromEntries(entries));
  }

  async isAdmin() {
    const { data, error } = await this.client.rpc('is_admin');
    return !error && data === true;
  }

  async save(table: TableName, input: unknown) {
    // Each relation keeps its specific generated domain type; runtime validation remains mandatory.
    const mutations = {
      profiles: () => this.client.from('profiles').upsert(tableSchemas.profiles.parse(input)),
      projects: () => this.client.from('projects').upsert(tableSchemas.projects.parse(input)),
      work_experiences: () =>
        this.client.from('work_experiences').upsert(tableSchemas.work_experiences.parse(input)),
      technology_categories: () =>
        this.client
          .from('technology_categories')
          .upsert(tableSchemas.technology_categories.parse(input)),
      technologies: () =>
        this.client.from('technologies').upsert(tableSchemas.technologies.parse(input)),
      social_links: () =>
        this.client.from('social_links').upsert(tableSchemas.social_links.parse(input)),
      site_settings: () =>
        this.client.from('site_settings').upsert(tableSchemas.site_settings.parse(input)),
      interactive_points: () =>
        this.client.from('interactive_points').upsert(tableSchemas.interactive_points.parse(input)),
      media_metadata: () =>
        this.client.from('media_metadata').upsert(tableSchemas.media_metadata.parse(input)),
      project_media: () =>
        this.client.from('project_media').upsert(tableSchemas.project_media.parse(input)),
      project_technologies: () =>
        this.client
          .from('project_technologies')
          .upsert(tableSchemas.project_technologies.parse(input)),
      experience_technologies: () =>
        this.client
          .from('experience_technologies')
          .upsert(tableSchemas.experience_technologies.parse(input)),
    };
    const { error } = await mutations[table]();
    if (error) throw new Error('Save failed. Check linked records and administrator permissions.');
  }

  async remove(table: TableName, id: string) {
    const { error } = await this.client.from(table).delete().eq('id', id);
    if (error) throw new Error('Delete failed. The record may still be referenced.');
  }

  async upload(file: File, alt: string) {
    validateUpload(file);
    if (!alt.trim() || alt.length > 300)
      throw new Error('Provide an image description of 1–300 characters.');
    // Decode before uploading; MIME labels alone do not establish that a file is an image.
    const bitmap = await createImageBitmap(file).catch(() => {
      throw new Error('Could not read this image. Choose a valid PNG, JPEG, or WebP file.');
    });
    const width = bitmap.width,
      height = bitmap.height;
    bitmap.close();
    if (width > 10000 || height > 10000 || width * height > 24000000)
      throw new Error('Image dimensions are too large.');
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const signature =
      file.type === 'image/png'
        ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
        : file.type === 'image/jpeg'
          ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
            String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    if (!signature) throw new Error('File content does not match its image type.');
    const {
      data: { user },
    } = await this.client.auth.getUser();
    if (!user) throw new Error('Sign in before uploading.');
    const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[file.type];
    const id = crypto.randomUUID(),
      path = `${user.id}/${id}.${extension}`;
    const { data } = this.client.storage.from('public-media').getPublicUrl(path);
    const media = tableSchemas.media_metadata.parse({
      id,
      path,
      url: data.publicUrl,
      alt,
      width,
      height,
      mime_type: file.type,
      size_bytes: file.size,
      status: 'draft',
      sort_order: 0,
    });
    const { error } = await this.client.storage
      .from('public-media')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error('Upload failed. Please check your permissions and file.');
    try {
      await this.save('media_metadata', media);
    } catch (error) {
      await this.client.storage.from('public-media').remove([path]);
      throw error;
    }
    return media;
  }
}
