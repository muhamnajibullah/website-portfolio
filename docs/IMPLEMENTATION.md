# Implementation decisions

## Monorepo

`apps/web` dan `apps/cms` menggunakan pnpm workspaces/Turborepo sesuai ARCHITECTURE.md. Package bersama hanya berisi hal yang digunakan kedua app: validation, domain/database types, Supabase repository, UI primitives, metadata helpers dan config. Three.js tetap berada di feature public web; tidak digunakan CMS.

## Content contracts

Core tables mengikuti panduan. Array responsibilities/challenges/solutions disimpan sebagai PostgreSQL `text[]`, bukan HTML. Relasi teknologi dan project gallery menggunakan junction tables, dengan publication status/order sendiri. Profile dan site-settings singleton dibatasi unique index. Experience related-project references menggunakan UUID array; hanya project yang tersedia dalam published query yang dirender. Image URL/alt/dimensions adalah field CMS. Table schema tidak memuat secret/private notes.

Shared Zod schemas memvalidasi response database dan mutation, sedangkan SQL constraints mengulang batas di database. Supabase client memakai tipe Database dari domain schemas. Identitas admin berasal dari `admin_profiles` yang tidak dapat dimutasi anon/authenticated, dan is_admin SECURITY DEFINER dengan search_path kosong. Jika akun telah enrolled MFA, token `aal2` wajib untuk admin policy. UI guard memberi UX; RLS tetap authorization boundary.

## Vite prerender strategy

Normal Mode dirender menjadi HTML pada build menggunakan React server renderer. Public query pada build tetap melalui RLS dan credential publik. Three.js menjadi lazy chunk setelah pengguna memilih Enter world, bukan ketika hanya membuka intro.

Tradeoff: snapshot statis, stable project files dan metadata diperbarui saat deployment. Client query dapat melihat data baru lebih cepat, tetapi snapshot lama tetap pernah diterbitkan. Publication operation harus disertai redeploy public app dalam release workflow. URL Deploy Hook sebaiknya disimpan pada trusted database webhook/server configuration, tidak pada client CMS. Sebelum production, pilih otomasi webhook atau proses release manual. Bila dibutuhkan revocation seketika untuk seluruh response HTML, gunakan rendering server dengan uncached per-request RLS query; SSG ini tidak menjanjikan revocation seketika.

Tidak ada credential backend atau akun external yang digunakan pada implementasi lokal. Docker engine tidak wajib untuk app atau tes PGlite. Setup Supabase nyata, WAF/rate limit cloud, backup dan deployment memerlukan konfigurasi project pemilik.

## Helicopter systems

Input, movement/bounds, follow-camera, model, rotor animation dan proximity dipisah. Movement menggunakan delta time, acceleration/deceleration dan velocity/altitude limits; tidak memakai rigid-body simulation. Discovery/focus/interaction radius tidak bergantung landing. Scene compact dengan primitive geometry, sederhana lighting tanpa shadows/postprocessing, adaptive DPR dan explicit resource/listener cleanup. DOM labels diperbarui secara imperative; React hanya menerima proximity-zone changes. Content overlays pause flight. Reduced motion menghentikan rotor rotation dan mempercepat camera-follow convergence.

Optional local GLB/GLTF loader membatasi origin dan lokasi resource; tidak menjalankan script dari metadata. Asset yang tidak berhasil dimuat menggunakan geometry development. Tidak ada asset final/foto/content yang diciptakan sebagai klaim portfolio.

## Security and rendering

Plain React text rendering dipakai untuk seluruh konten, tanpa dangerouslySetInnerHTML. SSR memakai escaping metadata dan encoded '<' pada JSON-LD. Upload public media memakai generated UUID paths, allowlist MIME/extension, size/dimension limits dan image decode/signature checks. Bucket configuration dan ownership/admin policies juga ditegakkan di backend. Browser validation tidak dianggap authorization. Public bucket tidak dipakai untuk rahasia atau private draft assets.

CSP/style-src mengizinkan inline styles untuk positioned UI, sementara script-src hanya origin sendiri. Hosting headers/WAF tidak dijalankan oleh Vite local preview; verifikasi header pada deployment Vercel. HSTS ditambahkan setelah domain HTTPS stabil. Migration dan policy tests merupakan versioned source; jangan mengubah production policy manual untuk mengatasi bug.
