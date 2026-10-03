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
