import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { render, pageMetadata, escapeHtml, safeJson } from '../.ssr/entry-server.js';
const content = JSON.parse(await readFile('public/content.json', 'utf8'));
const template = await readFile('dist/index.html', 'utf8');
const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const origin = new URL(
  env.VITE_SITE_URL || content.site_settings[0]?.site_url || 'http://localhost:5173',
).origin;
const routes = ['/', ...content.projects.map((project) => `/projects/${project.slug}`), '/404'];
for (const path of routes) {
  const project = content.projects.find((project) => path === `/projects/${project.slug}`);
  const meta = pageMetadata(content, project);
  const canonical = origin + (path === '/' ? '/' : path);
  const jsonLd = project
    ? {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description: project.summary,
        url: canonical,
        creator: { '@type': 'Person', name: meta.name },
      }
    : content.profiles[0]
      ? {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: meta.name,
          jobTitle: 'Software Engineer',
          url: origin,
          sameAs: content.social_links.map((link) => link.url),
        }
      : null;
  const extras = `<link rel="canonical" href="${escapeHtml(canonical)}"/><meta property="og:title" content="${escapeHtml(meta.title)}"/><meta property="og:description" content="${escapeHtml(meta.description)}"/><meta property="og:url" content="${escapeHtml(canonical)}"/><meta property="og:type" content="website"/>${meta.image ? `<meta property="og:image" content="${escapeHtml(meta.image)}"/>` : ''}<meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}"/>${!content.profiles.length || path === '/404' ? '<meta name="robots" content="noindex, follow"/>' : ''}`;
  let html = template
    .replace(
      /<title>.*?<\/title>/,
      `<title>${escapeHtml(path === '/404' ? 'Page not found · Software Engineer Portfolio' : meta.title)}</title>`,
    )
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escapeHtml(meta.description)}"/>`,
    )
    .replace('</head>', `${extras}</head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root" data-route="${escapeHtml(path)}">${render(content, path)}</div>`,
    );
  // Inert structured data: encoded '<' prevents CMS strings from closing the script tag.
  if (jsonLd)
    html = html.replace(
      '</body>',
      `<script type="application/ld+json">${safeJson(jsonLd)}</script></body>`,
    );
  const target = path === '/' ? 'dist' : `dist${path}`;
  await mkdir(target, { recursive: true });
  await writeFile(`${target}/index.html`, html);
  if (path === '/404') await writeFile('dist/404.html', html);
}
const sitemap = routes
  .filter((path) => path !== '/404')
  .map((path) => `<url><loc>${escapeHtml(origin + path)}</loc></url>`)
  .join('');
await writeFile(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`,
);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Prerendered ${routes.length} routes.`);
