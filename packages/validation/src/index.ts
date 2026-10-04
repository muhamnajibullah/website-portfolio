import { z } from 'zod';

const text = (max = 5000) => z.string().trim().max(max);
const url = z
  .url()
  .max(2048)
  .refine((value) => {
    try {
      return ['https:', 'http:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'Use an HTTPS or HTTP URL');
const optionalUrl = z.union([url, z.literal('')]).default('');
const date = z.union([z.iso.date(), z.literal('')]).default('');
const lines = z.array(text(1000)).max(40).default([]);
const base = {
  id: z.uuid(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  sort_order: z.number().int().min(0).max(10000).default(0),
};
const mediaFields = {
  image_url: optionalUrl,
  image_alt: text(300).default(''),
  image_width: z.number().int().min(1).max(10000).default(1200),
  image_height: z.number().int().min(1).max(10000).default(800),
};
export const profileSchema = z
  .object({
    ...base,
    ...mediaFields,
    name: text(100).min(1),
    title: z.literal('Software Engineer').default('Software Engineer'),
    intro: text(1000).default(''),
    about: text().default(''),
    location: text(150).default(''),
    email: z.union([z.email(), z.literal('')]).default(''),
    availability: text(150).default(''),
  })
  .refine((value) => !value.image_url || Boolean(value.image_alt), {
    path: ['image_alt'],
    message: 'Describe the uploaded image.',
  });
export const projectSchema = z
  .object({
    ...base,
    ...mediaFields,
    title: text(160).min(1),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(120),
    summary: text(500).default(''),
    description: text(20000).default(''),
    role: text(200).default(''),
    responsibilities: lines,
    challenges: lines,
    solutions: lines,
    engineering_approach: text(5000).default(''),
    key_features: lines,
    technical_challenges: lines,
    outcome: text(5000).default(''),
    start_date: date,
    end_date: date,
    live_url: optionalUrl,
    repository_url: optionalUrl,
    featured: z.boolean().default(false),
  })
  .refine((value) => !value.image_url || Boolean(value.image_alt), {
    path: ['image_alt'],
    message: 'Describe the uploaded image.',
  });
export const experienceSchema = z
  .object({
    ...base,
    ...mediaFields,
    organization: text(160).min(1),
    position: text(160).min(1),
    start_date: date,
    end_date: date,
    description: text().default(''),
    responsibilities: lines,
    related_project_ids: z.array(z.uuid()).max(30).default([]),
  })
  .refine((value) => !value.image_url || Boolean(value.image_alt), {
    path: ['image_alt'],
    message: 'Describe the uploaded image.',
  });
export const categorySchema = z.object({ ...base, name: text(100).min(1) });
export const technologySchema = z.object({
  ...base,
  name: text(100).min(1),
  category_id: z.uuid(),
});
export const socialSchema = z.object({ ...base, label: text(100).min(1), url });
export const settingsSchema = z.object({
  ...base,
  site_name: text(150).min(1),
  description: text(500).default(''),
  site_url: optionalUrl,
  og_image_url: optionalUrl,
  contact_heading: text(200).default('Let’s talk about your project.'),
  contact_text: text(1000).default(''),
});
export const pointSchema = z
  .object({
    ...base,
    project_id: z.uuid().nullable().default(null),
    experience_id: z.uuid().nullable().default(null),
    x: z.number().min(-38).max(38),
    y: z.number().min(1).max(10).default(3),
    z: z.number().min(-38).max(38),
    rotation: z.number().min(-Math.PI).max(Math.PI).default(0),
    marker_type: z.enum(['project', 'experience']).default('project'),
    discovery_radius: z.number().min(2).max(40).default(20),
    focus_radius: z.number().min(1).max(30).default(12),
    interaction_radius: z.number().min(1).max(15).default(7),
    enabled: z.boolean().default(true),
  })
  .refine(
    (p) => Boolean(p.project_id) !== Boolean(p.experience_id),
    'Choose either a project or a work experience, not both.',
  )
  .refine(
    (p) => p.interaction_radius <= p.focus_radius && p.focus_radius <= p.discovery_radius,
    'Open details distance must be no greater than preview distance. Preview distance must be no greater than marker visibility distance.',
  )
  .refine(
    (p) => p.marker_type === (p.project_id ? 'project' : 'experience'),
    'Choose a destination type that matches the linked project or work experience.',
  );
export const mediaSchema = z.object({
  ...base,
  path: z.string().regex(/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|jpg|webp)$/),
  url,
  alt: text(300).min(1),
  width: z.number().int().min(1).max(10000),
  height: z.number().int().min(1).max(10000),
  mime_type: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  size_bytes: z.number().int().min(1).max(5242880),
});
export const projectMediaSchema = z.object({ ...base, project_id: z.uuid(), media_id: z.uuid() });
export const projectTechnologySchema = z.object({
  ...base,
  project_id: z.uuid(),
  technology_id: z.uuid(),
});
export const experienceTechnologySchema = z.object({
  ...base,
  experience_id: z.uuid(),
  technology_id: z.uuid(),
});
export const tableSchemas = {
  profiles: profileSchema,
  projects: projectSchema,
  work_experiences: experienceSchema,
  technology_categories: categorySchema,
  technologies: technologySchema,
  social_links: socialSchema,
  site_settings: settingsSchema,
  interactive_points: pointSchema,
  media_metadata: mediaSchema,
  project_media: projectMediaSchema,
  project_technologies: projectTechnologySchema,
  experience_technologies: experienceTechnologySchema,
};
export const contentSchema = z.object({
  profiles: z.array(profileSchema),
  projects: z.array(projectSchema),
  work_experiences: z.array(experienceSchema),
  technology_categories: z.array(categorySchema),
  technologies: z.array(technologySchema),
  social_links: z.array(socialSchema),
  site_settings: z.array(settingsSchema),
  interactive_points: z.array(pointSchema),
  media_metadata: z.array(mediaSchema),
  project_media: z.array(projectMediaSchema),
  project_technologies: z.array(projectTechnologySchema),
  experience_technologies: z.array(experienceTechnologySchema),
});
export const emptyContent = contentSchema.parse({
  profiles: [],
  projects: [],
  work_experiences: [],
  technology_categories: [],
  technologies: [],
  social_links: [],
  site_settings: [],
  interactive_points: [],
  media_metadata: [],
  project_media: [],
  project_technologies: [],
  experience_technologies: [],
});
export function validateUpload(file: Pick<File, 'type' | 'size'>) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw new Error('Only PNG, JPEG and WebP images are allowed.');
  if (file.size < 1 || file.size > 5 * 1024 * 1024)
    throw new Error('Images must be between 1 byte and 5 MB.');
}
export function validatePublicKey(key: string) {
  if (key.startsWith('sb_publishable_')) return;
  if (key.startsWith('sb_secret_'))
    throw new Error('Privileged keys must never be used in a browser.');
  try {
    const payload: unknown = JSON.parse(atob(key.split('.')[1] ?? ''));
    if (z.object({ role: z.literal('anon') }).safeParse(payload).success) return;
  } catch {
    /* Reject malformed keys without reflecting their value. */
  }
  throw new Error('A Supabase publishable or legacy anon key is required.');
}
