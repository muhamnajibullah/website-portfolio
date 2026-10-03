import { describe, expect, it } from 'vitest';
import { render, pageMetadata, escapeHtml, safeJson } from '../../apps/web/src/entry-server';
import { fixture } from '../e2e/fixtures';
describe('prerendered normal content and metadata', () => {
  it('renders full project content, links and a single H1 without Three.js', () => {
    const html = render(fixture, '/projects/synthetic-test-project');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('Synthetic browser test project');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('Automated test responsibility');
    expect(html).not.toContain('<canvas');
    expect(pageMetadata(fixture, fixture.projects[0]).title).toContain(
      'Synthetic browser test project',
    );
  });
  it('escapes CMS content in attributes and structured data', () => {
    expect(escapeHtml('"/><script>')).toBe('&quot;/&gt;&lt;script&gt;');
    expect(safeJson({ name: '</script><script>alert(1)</script>' })).not.toContain('<');
    const html = render(fixture, '/');
    expect(html).toContain('&lt;script&gt;window.xss = true&lt;/script&gt;');
    expect(html).not.toContain('<script>window.xss');
  });
});
