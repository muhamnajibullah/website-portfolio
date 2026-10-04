# Software Engineer Portfolio

Implementasi React + TypeScript strict + Vite + Tailwind, dengan public web, CMS, shared packages, Supabase, dan dunia helicopter Three.js yang dimuat setelah **Enter world**.

Panduan produk tetap berada di root: `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `SECURITY.md`, dan `AGENTS.md`. Tidak ada identitas, foto, project, atau pengalaman fiktif pada aplikasi. Fixture sintetis hanya digunakan dalam tes.

Arah visual terbaru mengikuti [UI-UX-REVISION-DRIBBBLE.md](UI-UX-REVISION-DRIBBBLE.md):
dark editorial neutral, off-white typography, cyan, showcase project besar,
dan Light Mode yang accessible. Pedoman ini menggantikan palette forest.

## Jalankan lokal

Prasyarat: Node.js 22.21+ dan pnpm 10.32.1.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Jika pnpm belum tersedia, jalankan dari folder ini:

```sh
npx pnpm@10.32.1 install --frozen-lockfile
npx pnpm@10.32.1 dev
```

- Portfolio: http://localhost:5173
- CMS: http://localhost:5174

Tanpa konfigurasi Supabase, portfolio memakai snapshot kosong dengan placeholder yang jelas. Dunia helicopter bisa dijelajahi; belum ada tujuan project/experience sampai konten dipublikasikan. CMS menampilkan instruksi setup dan tidak menyediakan login admin palsu atau mutation lokal.

## Hubungkan Supabase

Panduan dashboard langkah demi langkah, pengisian card project, dan konfigurasi kedua aplikasi Vercel tersedia di [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

1. Buat Supabase project. Salin `.env.example` ke `apps/web/.env.local` dan `apps/cms/.env.local`.
2. Isi `VITE_SUPABASE_URL`, **publishable key**, dan `VITE_SITE_URL`. Jangan menggunakan secret/service-role key. Restart Vite setelah mengubah env.
3. Apply seluruh file `supabase/migrations/` secara berurutan melalui migration tooling Supabase, termasuk field case study editorial. Dengan CLI: `supabase link --project-ref <ref>`, lalu `supabase db push --dry-run` dan `supabase db push`. Pada project yang sudah linked, push hanya migrations yang belum diterapkan. Docker dibutuhkan hanya untuk menjalankan Supabase lokal (`supabase start`).
4. Nonaktifkan public signup pada Supabase Auth. Buat user administrator dari dashboard Auth dengan password yang kuat.
5. Dari SQL Editor/trusted database session, grant administrator untuk UUID user tersebut:

```sql
insert into public.admin_profiles(user_id) values ('UUID-DARI-AUTH-USERS');
```

6. Masuk ke CMS. Tambahkan satu Profile dan satu SEO/site-settings record. Title profil selalu **Software Engineer**. Isi foto/alt/dimensions bila sudah tersedia.
7. Buat dan publish kategori serta teknologi; project/experience; media metadata dan relasi; social links; lalu interactive points. Record relasi juga harus published dan parent-nya published agar terlihat publik.
8. Gunakan `Sort order` untuk reorder. `Edit / preview` memberi preview draft di dalam CMS yang terautentikasi. Publish/unpublish/archive tersedia dari listing.
9. Aktifkan authenticator dari Dashboard. Setelah MFA enrolled, kebijakan database menolak akses draft dan mutation dengan token `aal1`.

Bucket `public-media` hanya untuk gambar yang boleh diakses publik. Upload PNG/JPEG/WebP maksimal 5 MB, diverifikasi MIME, signature, decode dan dimensions di CMS. URL publik dapat disalin ke image URL/OG image fields. Metadata draft tidak membuat file dalam public bucket menjadi private. Delete record metadata tidak menghapus storage object; pembersihan file dilakukan dari Storage dashboard setelah memastikan tidak ada referensi.

## Interactive Mode

Tujuan project menampilkan nama saat discovery dan preview card ringkasan/tools saat helicopter mendekat. **Open details / E** membuka card DOM dengan seluruh problem, solusi dan tools dari CMS. Card Normal Mode menampilkan problem/solusi pertama; halaman `/projects/:slug` menyajikan semua poin. CMS menggunakan label **Project problems** (`challenges`) dan **Solutions provided** (`solutions`); schema database tetap sama.

Halaman case study juga mendukung **Engineering approach**, **Key features**,
**Technical challenges**, dan **Project outcome**. Field ini opsional dan
dapat diisi dari Projects; fitur/tantangan menerima satu poin per baris.

- `W/S`: maju/mundur, `A/D`: belok, mouse/drag: kamera.
- `↑/↓` atau `Space/Shift`: altitude; `E`: detail; `R`: reset; `Escape`: Normal Mode.
- Touch: joystick kiri, drag pada canvas untuk kamera, tombol altitude dan detail.
- Kamera follow dengan horizon stabil; tidak ada camera shake, banking ekstrem, motion blur, atau camera snap.
- Settings: sensitivity dan Auto/Low/Medium/High. Auto menurunkan DPR jika frame time tinggi. Rendering berhenti saat tab hidden; movement/render paused ketika sheet terbuka.
- Semua content tetap tersedia di Normal Mode. WebGL/scene failure memberi jalan kembali ke portfolio.

Helicopter dan environment default adalah geometry development sederhana. Model final opsional: simpan `.glb/.gltf` terverifikasi dan berlisensi di `apps/web/public/assets/`, lalu set `VITE_HELICOPTER_MODEL_PATH=/assets/helicopter.glb`. Root model maksimal 5 MB; texture/buffer references harus berada pada origin yang sama di `/assets/`. Verify total bytes, textures dan mesh count sebelum memasukkan model. Node rotor dapat dinamai `MainRotor`; model dinormalisasi ke ukuran world. Loading failure mempertahankan placeholder. Asset final belum dipilih.

## Build, SEO dan publication

```sh
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit
```

Build mengambil **published records melalui anon/publishable key dan RLS**, memvalidasinya, lalu prerender HTML untuk `/` dan `/projects/:slug`. HTML berisi content, metadata unik, canonical, OG, JSON-LD bila ada profil asli, sitemap dan robots. Placeholder page diberi `noindex`. Initial JS diperiksa terhadap budget 190 KB gzip dan kebocoran Three.js. Tidak ada remote font atau foto stock.

Client memeriksa konten terbaru saat load dan menyimpannya selama 60 detik. **Redeploy web setelah perubahan publikasi** untuk memperbarui HTML statis, snapshot, slug, sitemap, dan metadata. Menjadikan draft kembali tidak menarik salinan konten yang sebelumnya sudah diterbitkan dari deployment lama/cache. Production dapat memakai database webhook ke Vercel Deploy Hook melalui trusted server/dashboard; jangan menaruh URL deploy hook di `VITE_` env. Penjelasan keputusan ini ada di `docs/IMPLEMENTATION.md`.

## Deploy Vercel

Buat dua Vercel projects dari repo yang sama, root directory `apps/web` dan `apps/cms`. Aktifkan akses file di luar root directory untuk workspace packages. Gunakan pnpm install yang menghormati lockfile; build/output sudah ditentukan masing-masing `vercel.json`. Node.js 22. Environment Development/Preview/Production terpisah. `VITE_SITE_URL` harus origin portfolio sesungguhnya, juga di CMS untuk View portfolio.

Production headers menyediakan CSP, nosniff, Referrer-Policy, Permissions-Policy dan frame protection. CSP hanya mengizinkan media/API pada origin sendiri dan Supabase; sesuaikan allowlist jika memakai custom Supabase/media domain. Script tidak memakai `unsafe-inline`/`unsafe-eval`. Inline styles diizinkan untuk posisi label/control DOM Three.js. Tambahkan HSTS setelah domain HTTPS stabil. Set Supabase production Auth URL ke domain CMS.

Konfigurasikan Supabase Auth rate limits serta Vercel WAF/challenge untuk auth/CMS sesuai plan; uji agar penggunaan admin normal tetap bekerja. Endpoint mutation/upload langsung mengandalkan Auth + RLS/Storage policies dan batas Storage; tidak ada custom cookie-auth API/contact form. Backup database dan source media secara terpisah. Aktifkan observability dan monitor error serta abuse tanpa menyimpan token/password.

## Verifikasi

Unit tests memeriksa validation, privilege keys/uploads, flight movement/bounds dan proximity. RLS tests menjalankan **migration yang sama** pada PostgreSQL WASM (PGlite), dengan contract `auth/storage` minimal; menguji anon, non-admin, admin, MFA dan linked drafts. Ini tidak menggantikan smoke test terhadap Supabase Auth/Storage nyata setelah project tersedia.

Browser tests memeriksa CMS sign-in/validation/draft preview dengan transport mock, fallback WebGL, import lazy, WASD/proximity/detail/reset/exit, pointer/touch UI, XSS text rendering, aksesibilitas axe, dan overflow pada 360/390/430/768/820/1024/1280/1366/1440/1536/1920/2560/3840px. Editorial tests juga memeriksa multi-project composition, imagery, case study dan mobile navigation pada Dark/Light. Lakukan pemeriksaan manual pada perangkat touch nyata sebelum production. Laporan browser dan screenshot ada di `playwright-report/` dan `test-results/` setelah tes.

CI menjalankan locked install, lint, strict typecheck, unit/RLS tests, kedua build, bundle budget, audit, dan browser checks. Lighthouse target di PRD perlu diukur pada deployment representatif dengan konten/aset asli; skor lokal placeholder bukan jaminan production.

Hasil pemeriksaan lokal dicatat di [docs/VERIFICATION.md](docs/VERIFICATION.md).

Referensi implementasi: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa), [Vite SSR](https://vite.dev/guide/ssr), [Tailwind + Vite](https://tailwindcss.com/docs/installation/using-vite), [Three.js docs](https://threejs.org/docs/), dan [Vercel rewrites](https://vercel.com/docs/routing/rewrites).
