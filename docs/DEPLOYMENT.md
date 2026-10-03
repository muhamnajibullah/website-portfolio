# Menghubungkan Supabase dan Vercel

Panduan ini untuk repository portfolio ini. Jika akun/project sudah dibuat, langsung gunakan project tersebut. Satu Supabase project melayani dua aplikasi Vercel: portfolio publik (`apps/web`) dan CMS (`apps/cms`). Domain bawaan `.vercel.app` cukup untuk mulai; custom domain bisa ditambahkan kemudian.

## Konfigurasi project Anda

- Repository: [muhamnajibullah/website-portfolio](https://github.com/muhamnajibullah/website-portfolio).
- Supabase: [dashboard project](https://supabase.com/dashboard/project/ycjgsihugubpauxthspw); URL API `https://ycjgsihugubpauxthspw.supabase.co`.
- Vercel portfolio: [dashboard website-portfolio](https://vercel.com/muhammadnajibullah/website-portfolio).
- URL dan publishable key sudah diisi pada kedua `.env.local` lokal. File env tidak ikut Git.
- Pemeriksaan awal: endpoint Auth dapat diakses, tetapi tabel `profiles` dan `projects` belum ditemukan (`PGRST205`). Jalankan migration pada langkah 1 sebelum build portfolio dengan env Supabase aktif.
- Public signup masih aktif pada pemeriksaan awal. Nonaktifkan melalui langkah 2.
- Link Vercel di atas adalah dashboard akun, bukan domain website. Ambil domain production portfolio dari tab Domains/Deployments untuk `VITE_SITE_URL`; project CMS menggunakan root `apps/cms` secara terpisah.

Urutan lanjut paling singkat: migration → akun admin → isi konten CMS → konfigurasi Vercel dan env Production → deploy. Jika menggunakan plugin Supabase/Vercel, autentikasi akun memungkinkan langkah cloud dikerjakan langsung; publishable key sendiri tidak memiliki izin menjalankan SQL migration atau mengubah setting deployment.

## 1. Siapkan database Supabase

1. Buka project Anda di [Supabase Dashboard](https://supabase.com/dashboard).
2. Pada project baru yang belum memiliki tabel portfolio, buka **SQL Editor → New query**. Salin seluruh isi `supabase/migrations/202610030001_portfolio.sql`, kemudian **Run**. Migration membuat tabel, RLS, izin admin dan bucket gambar; jangan membuat ulang tabel secara manual. Jika migration sudah diterapkan, lanjutkan ke langkah berikutnya. Untuk project yang berisi data/schema lain, periksa konflik terlebih dahulu.
3. Pastikan tabel `profiles`, `projects`, `technologies`, `project_technologies`, `interactive_points`, serta `admin_profiles` muncul di Table Editor, dan bucket `public-media` muncul di Storage.
4. Ambil **Project URL** melalui dialog **Connect** atau **Integrations → Data API**, dan **publishable key** dari **Settings → API Keys**. Nama menu dapat berubah; yang dibutuhkan adalah URL `https://<project-ref>.supabase.co` dan key `sb_publishable_...`.

Publishable key memang digunakan browser. Akses data tetap dibatasi RLS. Jangan memakai `sb_secret_...`, `service_role`, database password, atau personal access token dalam env `VITE_`. [Dokumentasi API keys](https://supabase.com/docs/guides/getting-started/api-keys).

Pilihan CLI untuk migration: `supabase link --project-ref <project-ref>`, kemudian `supabase db push`. Jika Anda memilih SQL Editor, migration history CLI tidak otomatis tercatat; jangan menjalankan kedua cara untuk migration pertama tanpa menyelaraskan history. Docker hanya diperlukan jika ingin menjalankan stack Supabase lokal.

## 2. Buat akses admin CMS

1. Pada **Authentication → Sign In / Providers**, matikan **Allow new users to sign up**. Aktifkan provider Email untuk login password. [Konfigurasi Auth](https://supabase.com/docs/guides/auth/general-configuration).
2. Pada **Authentication → Users → Add user**, buat akun admin dengan email Anda dan password kuat. Konfirmasikan email pengguna tersebut melalui opsi dashboard agar akun dapat login.
3. Salin **User UID** dari daftar Auth Users, lalu jalankan SQL berikut di SQL Editor dengan UID Anda:

```sql
insert into public.admin_profiles (user_id)
values ('GANTI-DENGAN-USER-UID')
on conflict (user_id) do nothing;
```

Akun Auth tanpa keanggotaan `admin_profiles` tidak dapat mengelola CMS. Jangan menambahkan policy publik untuk mengatasi pesan akses ditolak.

## 3. Hubungkan aplikasi lokal

Dari root repository, buat file berikut hanya jika belum ada. Jangan menimpa konfigurasi yang sudah Anda isi:

```powershell
if (!(Test-Path -LiteralPath apps/web/.env.local)) {
  Copy-Item -LiteralPath .env.example -Destination apps/web/.env.local
}
if (!(Test-Path -LiteralPath apps/cms/.env.local)) {
  Copy-Item -LiteralPath .env.example -Destination apps/cms/.env.local
}
```

Isi kedua file dengan nilai milik project Anda:

```dotenv
VITE_SUPABASE_URL=https://GANTI-PROJECT-REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=GANTI-PUBLISHABLE-KEY
VITE_SITE_URL=http://localhost:5173
```

File `.env.local` diabaikan Git. Restart development server setelah mengubah env:

```powershell
npx pnpm@10.32.1 dev
```

Buka portfolio `http://localhost:5173` dan CMS `http://localhost:5174`. Login CMS dengan akun admin dari langkah 2. Dashboard harus terbuka; portfolio tetap menampilkan placeholder jika belum ada konten published.

## 4. Isi card project dari CMS

| Informasi pengunjung  | Field / menu CMS                                                  |
| --------------------- | ----------------------------------------------------------------- |
| Nama project          | Projects → Title                                                  |
| Deskripsi singkat     | Projects → Summary                                                |
| Problem project       | Projects → Project problems (field database `challenges`)         |
| Solusi yang diberikan | Projects → Solutions provided (`solutions`)                       |
| Tools yang digunakan  | Technologies + Project technologies                               |
| Detail pekerjaan Anda | Projects → Role, Responsibilities, Description                    |
| Gambar project        | Media Library → upload, lalu salin URL/alt/dimensions ke Projects |
| Tujuan helicopter     | Interactive points → Project id, posisi, radius, Enabled          |

Problem dan solusi menerima satu poin per baris. Preview draft menampilkan kedua field sebelum disimpan. Semua informasi memakai konten CMS; tidak ada project contoh yang dipublikasikan otomatis.

Urutan yang mudah:

1. Isi **Profile** dan **Site settings** dengan data asli; title profil tetap **Software Engineer**. Publish keduanya setelah siap.
2. Buat kategori di **Technology categories**, lalu tools di **Technologies**. Publish keduanya.
3. Buat **Projects**, isi nama, slug unik, ringkasan, problem dan solusi. Simpan sebagai draft untuk pemeriksaan, lalu publish.
4. Buat satu record **Project technologies** untuk setiap pasangan project/tool; publish relasinya juga.
5. Buat **Interactive points**, pilih project, kosongkan experience, pilih marker type `project`, aktifkan Enabled. Sebagai posisi awal development yang mudah ditemukan, gunakan `x=0`, `y=3`, `z=0`. Radius wajib discovery > focus > interaction; nilai default sudah sesuai. Publish point tersebut.
6. Muat ulang portfolio. Card Normal Mode menampilkan nama, ringkasan, problem dan solusi pertama, serta tools. Halaman detail menampilkan seluruh problem/solusi. Dalam dunia helicopter, nama tujuan muncul saat ditemukan; preview card muncul ketika mendekat. Tekan **E** atau **Open details** untuk membaca semua problem, solusi dan tools. Tidak perlu landing presisi.

Jika tools atau tujuan belum terlihat, cek bahwa **parent dan relasi sama-sama published**, point Enabled, dan project yang dipilih benar. RLS sengaja menyembunyikan relasi ke draft. Aktifkan authenticator/MFA dari CMS setelah login pertama.

## 5. Hubungkan repository GitHub ke Vercel

Pastikan kode monorepo lengkap berada di repository GitHub Anda, termasuk `packages/`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `supabase/migrations/`, serta kedua `vercel.json`. Jangan upload `node_modules`, build output atau `.env.local`.

Jika repository GitHub sudah dibuat tetapi remote lokal belum ada, gunakan URL repository Anda dari root workspace:

```powershell
git remote -v
git remote add origin https://github.com/GANTI-USERNAME/GANTI-REPOSITORY.git
git branch --show-current
```

Jalankan `git remote add` hanya jika `origin` belum ada. Push branch yang ditampilkan perintah terakhir, setelah perubahan yang ingin diterbitkan sudah di-commit. Jangan mengganti remote/branch yang sudah digunakan tanpa memeriksanya. Login GitHub melalui Git Credential Manager jika diminta.

Pada Vercel, buka project yang sudah dibuat → **Settings → Git** dan hubungkan repository tersebut. Jika belum memiliki dua project Vercel, gunakan **Add New → Project → Import** terhadap repository yang sama sebanyak dua kali. [Dokumentasi monorepo Vercel](https://vercel.com/docs/monorepos).

## 6. Atur dua project Vercel

| Setting          | Portfolio publik                     | CMS                                  |
| ---------------- | ------------------------------------ | ------------------------------------ |
| Root Directory   | `apps/web`                           | `apps/cms`                           |
| Framework Preset | Vite                                 | Vite                                 |
| Node.js Version  | 22.x                                 | 22.x                                 |
| Build Command    | `pnpm --filter @portfolio/web build` | `pnpm --filter @portfolio/cms build` |
| Output Directory | `dist`                               | `dist`                               |
| Install Command  | Auto-detect pnpm                     | Auto-detect pnpm                     |

Di **Settings → Build and Deployment → Root Directory**, aktifkan opsi menyertakan source di luar Root Directory, jika tersedia. Kedua aplikasi mengimpor shared workspace `packages/`. Build command, output dan security headers sudah ditetapkan dalam `apps/web/vercel.json` dan `apps/cms/vercel.json`.

Tambahkan env di **Settings → Environment Variables** pada **kedua project**, untuk **Production**:

| Nama                            | Nilai                                                                  |
| ------------------------------- | ---------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Project URL Supabase Anda                                              |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key project yang sama                                      |
| `VITE_SITE_URL`                 | Origin portfolio publik, misalnya `https://GANTI-PORTFOLIO.vercel.app` |
| `ENABLE_EXPERIMENTAL_COREPACK`  | `1`                                                                    |

`VITE_SITE_URL` di CMS tetap URL **portfolio publik**, karena digunakan tautan View portfolio. Ini berbeda dari Supabase Auth Site URL yang memakai URL **CMS**. Corepack memilih `pnpm@10.32.1` dari root `package.json`; biarkan install command auto-detect. [Package managers Vercel](https://vercel.com/docs/package-managers), [konfigurasi Corepack](https://vercel.com/docs/builds/configure-a-build).

Untuk Preview, gunakan Supabase project terpisah jika ingin menguji mutation CMS. Boleh biarkan env Supabase Preview kosong; preview akan memakai placeholder dan CMS menampilkan setup. Jangan mengaktifkan akses admin production untuk preview yang tidak dipercaya.

Set Production Branch sesuai branch GitHub yang benar; branch lokal awal repository ini adalah `master`, tetapi branch remote Anda dapat berbeda. Jalankan deployment pada kedua project. Jika URL public belum diketahui, gunakan domain production bawaan yang ditampilkan project Vercel, kemudian isi ulang `VITE_SITE_URL` dan redeploy. Perubahan env hanya berlaku pada deployment baru. [Environment variables Vercel](https://vercel.com/docs/environment-variables).

## 7. Konfigurasikan URL Auth dan domain

Di Supabase **Authentication → URL Configuration**:

- **Site URL**: origin CMS production, misalnya `https://GANTI-CMS.vercel.app`.
- **Redirect URLs**: URL CMS production yang tepat; tambahkan `http://localhost:5174` dan `http://127.0.0.1:5174` jika digunakan untuk development. Jangan mengizinkan wildcard seluruh domain Vercel.

Login CMS saat ini memakai email/password langsung, tanpa OAuth callback. URL configuration menetapkan tujuan default untuk flow email Auth; aplikasi belum menyediakan UI forgot-password. [Dokumentasi Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

Di CMS **Site settings**, isi `site_url` dengan origin portfolio production. `VITE_SITE_URL` production dan nilai ini sebaiknya sama agar canonical/sitemap konsisten. Jika memakai custom domain nanti, tambahkan domain di Vercel, ikuti DNS instructions dashboard, lalu perbarui kedua nilai tersebut serta Auth Site URL jika domain CMS berubah, dan redeploy.

## 8. Verifikasi koneksi dan publikasi

- Portfolio dapat dibuka tanpa login; card berisi konten published, draft tidak tampil.
- CMS production dapat login dan menyimpan draft; setelah logout admin tidak dapat membuka dashboard.
- Gambar dari `public-media` tampil. Gunakan hanya gambar publik PNG/JPEG/WebP ≤5 MB.
- `/projects/<slug>` dapat dibuka langsung dan direfresh; title, canonical dan isi HTML sesuai project.
- Interactive Mode dapat mendekati project, membuka card detail, reset dan kembali ke Normal Mode.
- Periksa `robots.txt` dan `sitemap.xml`; profil placeholder sengaja tidak diindeks.

**Setelah publish, unpublish, perubahan slug atau perubahan isi, redeploy project portfolio** untuk memperbarui snapshot HTML/SEO dan daftar route. Muat ulang browser untuk memperoleh data terbaru. Perubahan CMS tidak otomatis memicu deployment. Salinan konten yang pernah dipublikasikan dapat tetap berada pada deployment lama/cache sampai ditangani; jangan memasukkan data sensitif ke portfolio publik.

Otomasi redeploy dapat ditambahkan nanti memakai trusted server/webhook dan Vercel Deploy Hook. URL deploy hook adalah kredensial; jangan letakkan di `VITE_` env atau kirim ke browser.

## Troubleshooting

| Gejala                                            | Pemeriksaan                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| CMS masih menampilkan setup                       | Env harus ada pada project CMS, bukan hanya portfolio; restart/redeploy                                            |
| Login gagal                                       | Email/password dan status konfirmasi Auth user; provider Email aktif                                               |
| Login berhasil tetapi akses ditolak               | UID tepat ada di `admin_profiles`; MFA challenge sudah selesai jika enrolled                                       |
| Build snapshot gagal                              | Migration sudah applied, Supabase aktif, URL/key satu project dan tabel public dapat dibaca dengan publishable key |
| `workspace:*` atau shared package tidak ditemukan | Root Directory, file di luar root disertakan, lockfile/workspace ikut di GitHub, Corepack env aktif                |
| Card tidak muncul                                 | Project published, parent/junction published, browser reload; redeploy web untuk HTML statis                       |
| Tools tidak muncul                                | Technology category, technology dan project-technology link published                                              |
| Point tidak muncul                                | Enabled, published, project parent published, link project benar                                                   |
| URL project baru 404                              | Redeploy portfolio setelah menambah/mengganti slug                                                                 |
| Gambar/API diblokir CSP                           | Pakai domain standar `*.supabase.co` atau dokumentasikan allowlist custom domain di kedua `vercel.json`            |

Jangan menonaktifkan RLS untuk mengatasi error. URL repository, project URL, nama/domain Vercel dan error yang sudah disamarkan cukup untuk melanjutkan bantuan; password/token/secret key tidak diperlukan dalam percakapan.
