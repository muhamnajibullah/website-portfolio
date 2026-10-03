# PRD.md --- Personal Portfolio Software Engineer

## Product Vision

Personal portfolio yang memposisikan pemilik sebagai **Software
Engineer**. Website memiliki dua cara eksplorasi: **Normal Portfolio
Mode** yang cepat dan recruiter-friendly, serta **Interactive /
Mini-game Mode** berbasis Three.js yang menjadi signature experience.

## Goals

-   Menampilkan profil, project, tools, work experience, dan contact
    secara profesional.
-   Memberi user kebebasan memilih Normal atau Interactive Mode.
-   Memungkinkan seluruh konten utama dikelola dari CMS tanpa edit
    source code.
-   Responsive di mobile, tablet, desktop, HD/FHD/QHD/4K.
-   Tetap ringan, accessible, SEO-friendly, dan aman.
-   Deployment menggunakan Vercel dan Supabase.

## Core User Experience

### Normal Mode

Urutan utama: Navbar → Hero → About → Featured Projects → Tools → Work
Experience → Interactive CTA → Contact → Footer.

Hero menampilkan placeholder foto sampai foto pribadi diberikan pada
tahap implementasi, nama, title **Software Engineer**, intro singkat,
View Projects, dan Explore Interactive World.

### Interactive Mode

Three.js hanya dimuat ketika user memilih mode ini. Konsep interaksi
mengambil inspirasi dari spatial/game gallery reference yang diberikan
user, tetapi dibuat lebih sederhana, ringan, lembut, dan nyaman.

Desktop: WASD + mouse + interaction key/button.\
Mobile/tablet: virtual joystick + drag camera + touch interaction.

User bebas bergerak. Project dan work experience menjadi point of
interest di world. Tidak ada navigation rail yang memaksa urutan
tertentu.

## Spatial Interaction

Setiap point memiliki: - discovery radius; - focus radius; - interaction
radius.

Saat mendekat, marker dan label meningkat secara halus. Kamera tidak
boleh direbut secara mendadak. Pada interaction radius user dapat
membuka detail project/experience.

## Projects

Data: title, slug, summary, description, role, responsibilities,
technologies, challenges, solutions, images, status, dates, live URL,
repository URL opsional, featured, interactive visibility, dan world
position.

Project dapat dibaca dari normal listing maupun ditemukan sebagai point
dalam mini-game. Keduanya memakai source data yang sama.

## Work Experience

Data: organization, position, period, description,
responsibilities/impact, technologies, logo opsional, related projects,
interactive visibility, dan world position.

Selalu tersedia sebagai normal timeline sebagai fallback.

## Tools & Technologies

Dapat dikelompokkan menjadi Frontend, Backend, Mobile, Database,
DevOps/Cloud, Testing, dan Tools. Tidak menggunakan persentase skill
yang arbitrer.

## CMS

CMS mencakup: - Dashboard - Profile - Projects - Work Experiences -
Technologies - Interactive Points - Media Library - Social Links - SEO /
Site Settings

Admin dapat create, edit, publish/unpublish, archive, reorder, dan
preview konten.

## Platform

Frontend/CMS: React + TypeScript + Vite + Tailwind CSS.\
Interactive: Three.js, dengan React Three Fiber bila sesuai
implementasi.\
Data fetching: TanStack Query.\
Backend: Supabase PostgreSQL, Auth, Storage.\
Hosting/deployment: Vercel.\
Repository: monorepo.

## Performance

-   No Three.js canvas pada landing page normal.
-   Dynamic/lazy import interactive app.
-   Compressed textures dan optimized geometry.
-   Adaptive DPR dan quality level.
-   Minimal dynamic lights/shadows.
-   DOM overlay untuk teks/detail.
-   Pause/limit rendering ketika tidak diperlukan.
-   Responsive images dan lazy loading.
-   Font optimization.
-   Route/code splitting.
-   Performance budget dipantau dalam CI.

Target quality: Lighthouse Performance \>= 85 pada representative
production build; Accessibility/Best Practices/SEO \>= 90 sebagai
engineering targets, bukan jaminan pada semua device.

## SEO

Seluruh informasi penting harus tersedia sebagai crawlable HTML di
Normal Mode. Project memiliki stable URL `/projects/:slug`. Sediakan
unique title/description, canonical, Open Graph, sitemap.xml,
robots.txt, semantic headings, descriptive alt text, dan structured data
yang relevan. Mini-game bukan satu-satunya sumber informasi.

## Accessibility & Comfort

-   semantic HTML dan keyboard navigation;
-   visible focus;
-   sufficient contrast;
-   `prefers-reduced-motion`;
-   normal fallback untuk semua 3D content;
-   no head bob, forced camera spin, camera shake, motion blur,
    flashing, atau FOV ekstrem;
-   touch controls yang nyaman;
-   tombol Exit Interactive Mode selalu mudah ditemukan.

## Security Requirements

Rincian ada di `SECURITY.md`. Minimal: Supabase RLS + least privilege,
secure admin auth, no privileged secret in client, safe rendering, input
validation, upload validation, security headers, WAF/rate limiting,
dependency scanning, dan auditable migrations.

## MVP Acceptance

1.  Normal dan Interactive Mode sama-sama usable.
2.  User dapat berpindah mode kapan saja.
3.  Three.js tidak memblokir initial landing load.
4.  Project dan experience memakai source data CMS yang sama.
5.  WASD desktop dan touch mobile bekerja.
6.  3D failure memiliki graceful fallback.
7.  CMS mengelola konten tanpa source edit.
8.  Public content SEO-indexable tanpa menjalankan mini-game.
9.  Admin mutations terlindungi authentication + authorization.
10. Layout nyaman dari mobile sampai 4K.


## Interactive Vehicle — Helicopter

Interactive / Mini-game Mode menggunakan **helicopter sebagai player vehicle**, bukan flying car.

### Helicopter Experience
- User mengendalikan helicopter untuk menjelajahi world secara bebas.
- Desktop tetap mengutamakan kontrol keyboard + mouse yang mudah dipahami.
- Mobile/tablet menggunakan touch controls yang disederhanakan.
- Flight model harus **arcade/casual**, bukan simulator realistis.
- Tujuannya adalah eksplorasi portfolio, bukan menguji kemampuan user menerbangkan helicopter.
- Movement, yaw, altitude, acceleration, dan deceleration harus smooth serta mudah dikendalikan.
- Hindari camera shake, rotor vibration effect, banking ekstrem, dan gerakan yang mudah menyebabkan motion sickness.
- Helicopter dapat mendekati Project Area dan Work Experience Area untuk mengaktifkan Discovery, Focus, dan Interaction Radius.
- User tidak harus melakukan landing presisi untuk membuka konten; proximity yang aman sudah cukup.
- Sediakan reset/recenter apabila helicopter keluar dari area world atau posisi tidak nyaman.

### Helicopter Asset
Model helicopter tidak harus dibuat sendiri oleh pemilik portfolio.

Implementasi mendukung model `.glb/.gltf` yang:
- memiliki lisensi penggunaan yang sesuai;
- low-poly/optimized;
- ukuran file terkontrol;
- mempunyai hierarchy rotor yang memungkinkan rotor animation jika diperlukan.

Sebelum model final tersedia, development menggunakan placeholder geometry atau development asset. Asset placeholder tidak dianggap sebagai konten final.
