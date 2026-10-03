import { renderToString } from 'react-dom/server';
import { PublicApp } from './app/PublicApp';
import { contentSchema } from '@portfolio/validation';
export function render(input: unknown, path: string) {
  const content = contentSchema.parse(input);
  return renderToString(<PublicApp content={content} path={path} />);
}
export { pageMetadata, escapeHtml, safeJson } from '@portfolio/seo';
