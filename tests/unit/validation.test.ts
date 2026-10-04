import { describe, expect, it } from 'vitest';
import {
  projectSchema,
  pointSchema,
  profileSchema,
  validatePublicKey,
  validateUpload,
} from '../../packages/validation/src';
const id = '00000000-0000-4000-8000-000000000001';
describe('CMS trust boundaries', () => {
  it('rejects script protocols, invalid slugs, oversized text and a changed positioning', () => {
    expect(
      projectSchema.safeParse({ id, title: 'Test', slug: 'test', live_url: 'javascript:alert(1)' })
        .success,
    ).toBe(false);
    expect(projectSchema.safeParse({ id, title: 'Test', slug: '../admin' }).success).toBe(false);
    expect(projectSchema.safeParse({ id, title: 'x'.repeat(161), slug: 'test' }).success).toBe(
      false,
    );
    expect(profileSchema.safeParse({ id, name: 'Test', title: 'Designer' }).success).toBe(false);
    expect(
      projectSchema.safeParse({ id, title: 'Test', slug: 'test', live_url: 'invalid' }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse(projectSchema.parse({ id, title: 'Test', slug: 'test' })).success,
    ).toBe(true);
    expect(
      projectSchema.safeParse({
        id,
        title: 'Test',
        slug: 'test',
        image_url: 'https://example.test/photo.webp',
        image_alt: '',
      }).success,
    ).toBe(false);
  });
  it('requires exactly one spatial content link and ordered radii', () => {
    const point = { id, project_id: id, x: 0, z: 0 };
    expect(pointSchema.safeParse(point).success).toBe(true);
    expect(pointSchema.safeParse({ ...point, experience_id: id }).success).toBe(false);
    expect(
      pointSchema.safeParse({ ...point, interaction_radius: 15, focus_radius: 3 }).success,
    ).toBe(false);
    expect(pointSchema.safeParse({ ...point, x: Infinity }).success).toBe(false);
  });
  it('keeps older projects compatible and bounds optional case-study content', () => {
    const project = { id, title: 'Test', slug: 'test' };
    expect(projectSchema.parse(project)).toMatchObject({
      engineering_approach: '',
      key_features: [],
      technical_challenges: [],
      outcome: '',
    });
    expect(
      projectSchema.safeParse({ ...project, engineering_approach: 'x'.repeat(5001) }).success,
    ).toBe(false);
    expect(projectSchema.safeParse({ ...project, outcome: 'x'.repeat(5001) }).success).toBe(false);
    expect(
      projectSchema.safeParse({ ...project, technical_challenges: Array(41).fill('Challenge') })
        .success,
    ).toBe(false);
    expect(projectSchema.safeParse({ ...project, key_features: ['x'.repeat(1001)] }).success).toBe(
      false,
    );
  });
  it('rejects privileged client keys and unsupported upload size/types', () => {
    expect(() => validatePublicKey('sb_secret_never-expose')).toThrow();
    expect(() =>
      validatePublicKey(`a.${btoa(JSON.stringify({ role: 'service_role' }))}.b`),
    ).toThrow();
    expect(() => validatePublicKey('sb_publishable_test')).not.toThrow();
    expect(() => validateUpload({ type: 'image/svg+xml', size: 120 })).toThrow();
    expect(() => validateUpload({ type: 'image/png', size: 5242881 })).toThrow();
    expect(() => validateUpload({ type: 'image/webp', size: 120 })).not.toThrow();
  });
});
