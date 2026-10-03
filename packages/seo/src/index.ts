import type { Content, Project } from '@portfolio/types';
export function pageMetadata(content: Content, project?: Project) {
  const profile = content.profiles[0],
    settings = content.site_settings[0];
  const name = profile?.name || settings?.site_name || 'Software Engineer Portfolio';
  return {
    title: project ? `${project.title} · ${name}` : `${name} · Software Engineer`,
    description:
      project?.summary ||
      settings?.description ||
      'A software engineer’s projects, tools, experience and interactive portfolio.',
    image: project?.image_url || settings?.og_image_url || '',
    name,
  };
}
export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ??
      character,
  );
}
export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
