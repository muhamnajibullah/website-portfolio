# Local verification — 2026-10-03

Lingkungan: Windows, Node.js 22.21.0, pnpm 10.32.1, Chromium melalui Playwright.

| Check | Hasil |
| --- | --- |
| ESLint | Pass |
| TypeScript strict, seluruh workspace dan test/config files | Pass |
| Unit + migration/RLS tests | 12 passed |
| Production build web + CMS | Pass |
| Bundle budget | 111.3 KB initial JS gzip; Three.js lazy |
| Browser tests | 19 passed |
| Responsive | 360/390/430/768/820/1024/1366/1440/1920/2560/3840px tanpa horizontal overflow |
| Touch | Joystick, release input, altitude, proximity, details, reset dan exit pada 390×844, 820×1180, 1180×820 |
| Basic accessibility | axe WCAG 2 A/AA + 2.1 AA: Normal Mode, intro modal, CMS setup |
| Failure | WebGL unavailable memberi fallback Normal Mode |
| Content safety | XSS tampil sebagai teks; invalid URL ditolak di CMS dan SQL |
| Auth | CMS sign-in/create/validation/preview diuji dengan transport mock |
| No-JS HTML | Satu H1 dan konten Normal Mode tersedia dalam prerendered HTML |
| Browser errors pada preview placeholder | Tidak ditemukan |
| Dependency audit | Tidak ada known vulnerabilities pada audit seluruh dependencies |

RLS tests menjalankan migration SQL pada PostgreSQL WASM/PGlite dengan minimal Supabase auth/storage contracts: anon read-only, non-admin tidak dapat mutation/self-promote/read draft, admin dapat mutation, linked draft points disembunyikan, invalid upload path ditolak, dan enrolled MFA admin wajib `aal2`.

Lighthouse **13.5.0**, default mobile audit terhadap production preview dengan placeholder:

| Category / metric | Hasil |
| --- | --- |
| Performance | 98 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 66 |
| First Contentful Paint | 1.6 s |
| Largest Contentful Paint | 1.7 s |
| Total Blocking Time | 140 ms |
| Cumulative Layout Shift | 0 |

Placeholder page sengaja memakai `noindex`; SEO indexing target baru relevan setelah profil asli published dan origin production dikonfigurasi. Metadata, canonical, sitemap dan escaping SSR sudah diuji. Lighthouse 13.5 juga melaporkan rekomendasi `llms.txt`. Audit production dengan konten/aset asli tetap diperlukan.

Software WebGL pada headless Chromium digunakan untuk tes kontrol; touch tests memilih Low quality agar rendering emulator stabil. Pengujian touch perangkat fisik, cloud Auth/Storage, Vercel headers/WAF/rate limits, dan deployment belum dijalankan karena project cloud/aset asli belum tersedia. Docker engine tidak berjalan; database policy test tetap berjalan melalui PGlite.

Artefak lokal (diabaikan Git): `playwright-report/`, `test-results/preview-desktop.png`, `test-results/preview-mobile.png`, `test-results/preview-cms.png`, `test-results/lighthouse-mobile.json`.
