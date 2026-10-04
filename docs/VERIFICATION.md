# Local verification — 2026-10-03

Lingkungan: Windows, Node.js 22.21.0, pnpm 10.32.1, Chromium melalui Playwright.

| Check                                                      | Hasil                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ESLint                                                     | Pass                                                                                                   |
| TypeScript strict, seluruh workspace dan test/config files | Pass                                                                                                   |
| Unit + migration/RLS tests                                 | 12 passed                                                                                              |
| Production build web + CMS                                 | Pass                                                                                                   |
| Bundle budget                                              | 111.5 KB initial JS gzip; Three.js lazy                                                                |
| Browser tests                                              | 19 passed                                                                                              |
| Responsive                                                 | 360/390/430/768/820/1024/1366/1440/1920/2560/3840px tanpa horizontal overflow                          |
| Touch                                                      | Joystick, release input, altitude, proximity, details, reset dan exit pada 390×844, 820×1180, 1180×820 |
| Basic accessibility                                        | axe WCAG 2 A/AA + 2.1 AA: Normal Mode, intro modal, CMS setup, project detail dialog                   |
| Failure                                                    | WebGL unavailable memberi fallback Normal Mode                                                         |
| Content safety                                             | XSS tampil sebagai teks; invalid URL ditolak di CMS dan SQL                                            |
| Auth                                                       | CMS sign-in/create/validation/preview problem dan solusi diuji dengan transport mock                   |
| No-JS HTML                                                 | Satu H1 dan konten Normal Mode tersedia dalam prerendered HTML                                         |
| Browser errors pada preview placeholder                    | Tidak ditemukan                                                                                        |
| Dependency audit                                           | Tidak ada known vulnerabilities pada audit seluruh dependencies                                        |

RLS tests menjalankan migration SQL pada PostgreSQL WASM/PGlite dengan minimal Supabase auth/storage contracts: anon read-only, non-admin tidak dapat mutation/self-promote/read draft, admin dapat mutation, linked draft points disembunyikan, invalid upload path ditolak, dan enrolled MFA admin wajib `aal2`.

Card project diperiksa berisi nama, summary, problem, solusi dan tools pada seluruh responsive widths. Preview world diperiksa saat mendekat; dialog berisi seluruh problem/solusi, tools, dan tautan project yang stabil. Dialog touch diperiksa tanpa horizontal overflow pada mobile/tablet. Fixture hanya berada pada tes.

Playwright menggunakan `--use-angle=swiftshader-webgl` untuk membatasi software rendering pada WebGL; memaksa compositor browser keseluruhan ke SwiftShader sebelumnya memperlambat input/teardown. Keyboard/touch memakai Low quality; touch approach memakai input analog ringan agar tidak melewati radius selama assertion emulator. Referensi: [Chromium SwiftShader](https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/swiftshader.md).

Lighthouse **13.5.0**, default mobile audit terhadap production preview dengan placeholder (diukur pada implementasi awal, sebelum penambahan field card):

| Category / metric        | Hasil  |
| ------------------------ | ------ |
| Performance              | 98     |
| Accessibility            | 100    |
| Best Practices           | 100    |
| SEO                      | 66     |
| First Contentful Paint   | 1.6 s  |
| Largest Contentful Paint | 1.7 s  |
| Total Blocking Time      | 140 ms |
| Cumulative Layout Shift  | 0      |

Placeholder page sengaja memakai `noindex`; SEO indexing target baru relevan setelah profil asli published dan origin production dikonfigurasi. Metadata, canonical, sitemap dan escaping SSR sudah diuji. Lighthouse 13.5 juga melaporkan rekomendasi `llms.txt`. Audit production dengan konten/aset asli tetap diperlukan.

Software WebGL pada headless Chromium digunakan untuk tes kontrol; touch tests memilih Low quality agar rendering emulator stabil. Pengujian touch perangkat fisik dan WAF/custom rate-limit behavior belum dilakukan. Docker engine tidak berjalan; database policy test lokal tetap berjalan melalui PGlite. Pemeriksaan cloud dilaporkan terpisah di bawah.

Artefak lokal (diabaikan Git): `playwright-report/`, `test-results/preview-desktop.png`, `test-results/preview-mobile.png`, `test-results/preview-cms.png`, `test-results/lighthouse-mobile.json`.

## Production verification — 2026-10-04

Portfolio: <https://website-portfolio-one-sandy.vercel.app>. CMS: <https://website-portfolio-cms.vercel.app>. Kedua project memakai Node.js 22.x/pnpm 10.32.1, root aplikasi yang tepat, shared workspace, Supabase production dan GitHub production branch `master`.

| Check                         | Hasil                                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deployment web + CMS          | READY; production aliases memberi HTTP 200 tanpa login Vercel                                                                                                         |
| Supabase migration            | `202610030001_portfolio.sql` applied dengan migration history CLI                                                                                                     |
| Cloud RLS                     | `supabase/tests/deployment-check.sql` pass: anon published-only/read-only, non-admin mutation/draft/self-promotion ditolak, exposed RLS dan bucket restrictions benar |
| Auth configuration            | Signup disabled; Site URL CMS dan exact redirect allowlist; sign-in/token verification limits 10                                                                      |
| Browser CMS → Supabase        | Password login, admin RPC/dashboard, draft save/delete, draft hidden from public, sign-out pass                                                                       |
| Browser CMS → Storage         | PNG upload, draft metadata, public image HTTP 200, metadata dan storage object cleanup pass                                                                           |
| Public rendering              | HTTP 200, one logical H1, placeholder content, robots/sitemap memakai production origin                                                                               |
| Responsive production         | 360/390/430/768/820/1024/1366/1440/1920/2560/3840px tanpa horizontal overflow                                                                                         |
| Accessibility production      | Axe: Normal Mode dan CMS login tanpa violations                                                                                                                       |
| Interactive production        | Tidak ada Three.js chunk sebelum Enter world; canvas, Low quality, reset, exit dan focus return pass                                                                  |
| Browser/bundle safety         | Tidak ditemukan page errors/failed requests; generated password, full secret key dan service-role JWT tidak ditemukan pada bundle yang dimuat                         |
| Vercel headers                | CSP, nosniff, frame protection dan referrer policy diterapkan; CMS noindex/nofollow dan no-store                                                                      |
| Vercel error log scan         | Tidak ada error log pada kedua project untuk interval satu jam saat pemeriksaan                                                                                       |
| Web production initial bundle | 172.8 KB gzip dengan Supabase aktif; di bawah budget 190 KB; Three.js tetap lazy                                                                                      |

Fixture SQL cloud tidak di-commit ke database. Draft dan PNG untuk browser smoke check dibuat sementara lalu dihapus; tidak ada profil/project/foto fiktif sebagai final content. Konten asli belum tersedia, sehingga project detail route dan proximity card menggunakan konten nyata tetap menunggu pengisian CMS; alur tersebut sudah diuji dengan fixture pada browser tests lokal/CI.

Artefak production lokal (diabaikan Git): `test-results/production-verification.json`, `test-results/production-web.png`, `test-results/production-mobile.png`, `test-results/production-cms.png`.

## Forest theme and scroll recovery — 2026-10-04

`UI-THEME.md` menjadi sumber semantic palette public/CMS/HUD dan development world. Dark default, Light manual, preference `portfolio-theme`, dan early external `/theme.js` bekerja tanpa melonggarkan CSP. Saved theme diperiksa pada prerendered HTML dengan module React diblokir. Storage diblokir tetap memberi default Dark dan toggle yang usable. Foto/screenshot CMS tidak difilter atau direcolor.

Shared scroll lock menyimpan overflow asli pada owner pertama dan memulihkannya saat owner terakhir keluar. Intro → world, Settings/detail nested, cancel, Normal Mode dan Escape tidak meninggalkan lock. Fokus kembali ke CTA asli dengan `preventScroll`; posisi sebelum masuk dipulihkan tanpa smooth-scroll. Callback exit stabil juga mencegah focus reset saat proximity berubah.

Browser suite: **25 passed**. Semua 11 responsive widths diperiksa dalam Dark/Light, dengan fixture test terpisah dari konten production. Scroll/posisi/fokus dan beberapa siklus world diperiksa di 390/1440px, termasuk pemulihan custom overflow styles. Swipe sesudah exit diperiksa dengan touch input pada 390×844, 820×1180 dan 1180×820. Axe tidak menemukan violations pada Normal Mode, intro, project detail, CMS setup/dashboard dan editor pada kedua theme. Reduced motion menghilangkan entrance/hover transforms; controls keyboard/touch dan lazy Three.js tetap pass.

Border kontrol memakai semantic token khusus dengan kontras sekitar 4:1 terhadap surface; border dekoratif tetap mengikuti palette. Feedback menggunakan transisi properti spesifik, hover/press tombol, ikon, navbar underline, tonal card hover, serta entrance pendek. Tidak ada `transition: all`, efek kamera baru, bloom, filter pada aset, atau animasi terus-menerus di section.

Untuk mengulang fixture browser tests ketika `.env.local` terhubung ke Supabase, jalankan `pnpm build:e2e` lalu `pnpm test:e2e`. Script menimpa hanya environment child process saat build, tidak mengedit file konfigurasi lokal atau data cloud. Jalankan `pnpm build` sesudahnya untuk memulihkan build dengan konfigurasi asli. `pnpm check` tetap memeriksa build konfigurasi asli; initial JS final 169.6 KB gzip termasuk bootstrap theme, dengan budget 190 KB.

Artefak visual lokal (ignored): `test-results/portfolio-{dark,light}.png`, `test-results/portfolio-light-{360,768,1440}.png`, `test-results/world-{dark,light}.png`, `test-results/cms-{dark,light}.png`, dan `test-results/cms-dashboard-{dark,light}.png`. Verifikasi touch perangkat fisik tetap belum dilakukan.

## Centered popups and clearer copy — 2026-10-04

Shared native `Dialog` memakai fixed positioning, inset nol, auto margins,
batas tinggi viewport, dan internal overflow. Intro berada di tengah tanpa
horizontal overflow pada seluruh 11 responsive widths. Project detail dan
Flight settings diperiksa pada desktop serta touch mobile/tablet. Form CMS
yang panjang dan konfirmasi hapus diperiksa pada 360/390/820/1440px; popup
tetap di tengah dan form dapat scroll di dalamnya.

Konfirmasi hapus CMS menggantikan `window.confirm`. Cancel tidak mengirim
DELETE, menjaga item, dan mengembalikan fokus ke trigger. Konfirmasi menghapus
hanya item yang dipilih; kontrol penutup dinonaktifkan selama request.
Verifikasi create/delete memakai transport mock, tanpa mutation data cloud.

Copy antarmuka public, world, auth/CMS, empty/loading/error states, label form,
dan fallback metadata diperjelas dalam Bahasa Inggris sederhana. Payload keys,
status values, batas validasi, authorization, RLS, dan alur upload tetap sama.
Konten profil/project yang ditulis melalui CMS tidak ditimpa. Penjelasan upload
mengikuti Media Library yang sudah tersedia: upload menghasilkan URL publik,
sementara pemasangan cover dan tautan galeri dilakukan terpisah.

`pnpm check` pass: ESLint, TypeScript strict, 12 unit/migration/RLS tests,
production build, dan budget initial JS **169.2 KB gzip** dengan Three.js lazy.
`pnpm build:e2e` dan seluruh **25 browser tests pass**. Axe tidak menemukan
violations pada flows yang diuji, termasuk konfirmasi hapus. Pemeriksaan
visual melalui agent-browser tidak menemukan browser errors pada intro
desktop/mobile. Artefak ignored: `.vercel/centered-intro-{desktop,mobile}.png`,
`test-results/cms-editor-centered.png`, `test-results/cms-delete-centered.png`.
