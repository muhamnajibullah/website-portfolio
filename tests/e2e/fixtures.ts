import {
  contentSchema,
  emptyContent,
  projectSchema,
  profileSchema,
  categorySchema,
  technologySchema,
  experienceSchema,
  pointSchema,
} from '../../packages/validation/src';
const uuid = (suffix: number) => `00000000-0000-4000-8000-${String(suffix).padStart(12, '0')}`;
export const fixture = contentSchema.parse({
  ...emptyContent,
  profiles: [
    profileSchema.parse({
      id: uuid(1),
      name: 'E2E test profile',
      status: 'published',
      intro: 'Synthetic content used only by automated browser tests.',
      about: '<script>window.xss = true</script>',
      email: 'e2e@example.test',
    }),
  ],
  projects: [
    projectSchema.parse({
      id: uuid(2),
      title: 'Synthetic browser test project',
      slug: 'synthetic-test-project',
      status: 'published',
      featured: true,
      summary: 'This fixture is never part of final portfolio content.',
      description: '<img src=x onerror=alert(1)>',
      role: 'Test role',
      responsibilities: ['Automated test responsibility'],
      challenges: ['Synthetic problem for browser verification.', 'Second synthetic problem.'],
      solutions: ['Synthetic solution for browser verification.', 'Second synthetic solution.'],
    }),
  ],
  work_experiences: [
    experienceSchema.parse({
      id: uuid(3),
      organization: 'Synthetic test organization',
      position: 'Test position',
      status: 'published',
      description: 'Test description',
      related_project_ids: [uuid(2)],
    }),
  ],
  technology_categories: [
    categorySchema.parse({ id: uuid(4), name: 'Testing', status: 'published' }),
  ],
  technologies: [
    technologySchema.parse({
      id: uuid(5),
      category_id: uuid(4),
      name: 'Browser test tool',
      status: 'published',
    }),
  ],
  project_technologies: [
    {
      id: uuid(6),
      project_id: uuid(2),
      technology_id: uuid(5),
      status: 'published',
      sort_order: 0,
    },
  ],
  interactive_points: [
    pointSchema.parse({
      id: uuid(7),
      project_id: uuid(2),
      x: 0,
      y: 3,
      z: 0,
      status: 'published',
      interaction_radius: 7,
    }),
  ],
});

// These records and images are intercepted in browser tests; they never enter a CMS or build snapshot.
export const editorialFixture = contentSchema.parse({
  ...fixture,
  profiles: [
    {
      ...fixture.profiles[0]!,
      image_url: 'https://fixture.supabase.co/portrait.webp',
      image_alt: 'Synthetic portrait layout fixture',
    },
  ],
  projects: [
    {
      ...fixture.projects[0]!,
      start_date: '2025-01-01',
      image_url: 'https://fixture.supabase.co/project.webp',
      image_alt: 'Synthetic project image fixture',
      engineering_approach: '<script>window.caseStudyXss = true</script>',
      key_features: ['Browser test feature'],
      technical_challenges: ['Browser test technical challenge'],
      outcome: 'Browser test outcome',
    },
    {
      ...fixture.projects[0]!,
      id: uuid(8),
      slug: 'second-browser-project',
      title: 'Second synthetic browser project',
      image_url: 'https://fixture.supabase.co/second.webp',
      image_alt: 'Second synthetic image',
      start_date: '2026-01-01',
    },
    {
      ...fixture.projects[0]!,
      id: uuid(9),
      slug: 'third-browser-project',
      title: 'Third synthetic browser project',
      image_url: 'https://fixture.supabase.co/third.webp',
      image_alt: 'Third synthetic image',
      start_date: '2026-02-01',
    },
  ],
  media_metadata: [
    {
      id: uuid(10),
      status: 'published',
      sort_order: 0,
      path: `${uuid(1)}/${uuid(10)}.webp`,
      url: 'https://fixture.supabase.co/gallery.webp',
      alt: 'Synthetic gallery fixture',
      width: 1200,
      height: 800,
      mime_type: 'image/webp',
      size_bytes: 1000,
    },
  ],
  project_media: [
    { id: uuid(11), status: 'published', sort_order: 0, project_id: uuid(2), media_id: uuid(10) },
  ],
});
