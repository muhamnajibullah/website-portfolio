# SECURITY.md --- Vercel + Supabase Security Baseline

## 1. Security Model

Gunakan defense in depth. Vercel/WAF, Supabase Auth/RLS, browser
security, validation, dan application logic saling melengkapi. Tidak ada
satu lapisan yang dianggap cukup sendirian.

## 2. Secrets

Client hanya menggunakan Supabase **publishable key**. Publishable key
bukan authorization boundary.

Supabase secret/elevated key: - server-only; - tidak pernah memakai
prefix env yang diekspos client; - tidak pernah di-commit; - tidak
pernah dikirim ke browser; - tidak pernah dicetak ke logs; - rotate
segera jika terindikasi bocor.

Gunakan Vercel environment variables untuk secrets dan pisahkan
Preview/Production.

## 3. Database Authorization

Aktifkan RLS pada seluruh table exposed melalui Data API.

Principle: - `anon`: SELECT hanya terhadap published public content yang
diperlukan; - `authenticated`: tidak otomatis berarti admin; - admin
mutations hanya untuk identity/role yang diizinkan; - revoke grants yang
tidak diperlukan; - test allow + deny cases.

Public visitor tidak boleh INSERT/UPDATE/DELETE portfolio content.

Policy migrations harus version-controlled dan diuji.

## 4. Admin Authentication

-   Supabase Auth untuk CMS.
-   Jangan menganggap hidden `/admin` sebagai security.
-   UI route guard hanya convenience.
-   Database policy tetap final authorization layer.
-   gunakan strong password;
-   MFA direkomendasikan untuk admin bila tersedia/diaktifkan;
-   generic login error untuk mengurangi account enumeration;
-   rate limit/challenge repeated auth abuse.

## 5. XSS

React text interpolation menjadi default untuk CMS content.

Jangan render arbitrary HTML dari CMS.

Jika rich text HTML benar-benar dibutuhkan: 1. define allowlist
tags/attributes; 2. sanitize dengan maintained sanitizer; 3. reject
scripts, event handlers, dangerous URL schemes; 4. tetap gunakan CSP
sebagai lapisan tambahan, bukan pengganti sanitization.

User-controlled URL divalidasi protocol-nya. Jangan mengizinkan
`javascript:` URL.

## 6. SQL Injection

Gunakan Supabase client/PostgREST/query builder atau parameterized
database functions.

Dilarang: - string-concatenated SQL dari input; - dynamic raw SQL tanpa
strict allowlist/parameters.

Untuk sorting/filter field dinamis, gunakan allowlist nama field yang
valid.

RLS tetap diperlukan walaupun query parameterized; keduanya
menyelesaikan masalah berbeda.

## 7. Input Validation

Validasi runtime pada trust boundary: - CMS forms; - server/edge
functions; - database constraints; - upload metadata.

Gunakan allowlist dan batas panjang untuk slug, title, URL, coordinates,
radius, dan text fields. Jangan hanya mengandalkan TypeScript types.

## 8. File Upload Security

-   allowlist MIME/extension yang benar-benar dibutuhkan;
-   size limits;
-   generated/safe storage paths;
-   jangan percaya original filename;
-   image decode/processing bila pipeline mendukung;
-   SVG hanya jika benar-benar diperlukan dan diperlakukan sebagai
    active content;
-   storage RLS/policies;
-   public bucket hanya untuk aset yang memang public.

Jangan menerima executable/script upload.

## 9. Vercel Firewall / DDoS

Gunakan Vercel automatic DDoS mitigation sebagai platform layer dan WAF
untuk abuse di layer aplikasi.

Rules yang perlu dipertimbangkan: - stricter rate limit/challenge untuk
CMS/auth routes; - rate limit untuk upload/mutation endpoints; -
bot/abuse protection untuk contact form jika Phase 2; - managed
ruleset/OWASP protections sesuai availability; - block/challenge
patterns berdasarkan observability, bukan random IP lists.

Rate limits harus diuji agar tidak mengunci penggunaan admin normal.

## 10. Application Rate Limiting

Endpoint yang mahal atau melakukan mutation harus mempunyai batas
tambahan bila diekspos melalui server/edge function.

Key dapat berdasarkan kombinasi IP/user/session sesuai endpoint. Jangan
mengandalkan IP sebagai identity/authorization.

## 11. Security Headers

Set headers yang sesuai: - Content-Security-Policy; -
`X-Content-Type-Options: nosniff`; - `Referrer-Policy`; -
`Permissions-Policy`; - frame protection melalui CSP
`frame-ancestors`; - HSTS pada production HTTPS setelah domain/HTTPS
stabil.

CSP harus disesuaikan dengan Vercel, Supabase, image/font sources, dan
kebutuhan Three.js. Hindari `unsafe-eval`; minimalkan `unsafe-inline`.

## 12. CSRF

Jika architecture menggunakan cookie-authenticated custom mutation
endpoints, gunakan SameSite cookies yang tepat dan CSRF
protection/origin checks sesuai flow.

Jangan berasumsi CORS adalah CSRF protection.

## 13. CORS

Batasi custom server/edge API origins ke domain yang memang diperlukan.
CORS bukan authorization; setiap mutation tetap memerlukan auth +
authorization.

## 14. Clickjacking

Gunakan CSP `frame-ancestors` untuk mencegah embedding yang tidak
diinginkan, terutama CMS.

## 15. Open Redirect / External Links

Validate redirect destinations. Untuk external links yang membuka tab
baru gunakan rel yang sesuai. Jangan menerima arbitrary redirect URL
dari query tanpa allowlist.

## 16. Logging & Privacy

Jangan log: - passwords; - access/refresh tokens; - secret keys; -
sensitive request bodies.

Log security-relevant events secukupnya: failed admin login patterns,
unexpected authorization failures, upload rejection, dan server errors
tanpa secret.

## 17. Dependencies

-   lockfile committed;
-   dependency updates direview;
-   audit known vulnerabilities;
-   hapus package yang tidak digunakan;
-   hindari package kecil yang tidak perlu untuk fungsi trivial.

## 18. Three.js Security

3D asset URLs harus berasal dari trusted CMS/storage locations. Jangan
menjalankan script dari model metadata. Treat imported assets sebagai
untrusted data saat berasal dari upload.

## 19. CMS Content Publication

Gunakan explicit `draft/published/archived`. Public policy/query hanya
mengembalikan published content. Preview draft harus membutuhkan
authenticated admin context.

## 20. Backup & Recovery

Database migrations version-controlled. Gunakan backup capability
Supabase sesuai plan dan pahami bahwa database backup tidak otomatis
berarti seluruh Storage object ikut ter-backup. Simpan source assets
penting secara terpisah bila diperlukan.

## 21. Security Testing Checklist

Sebelum production: - anon cannot mutate content; - non-admin
authenticated user cannot mutate admin content; - unpublished content
tidak bocor; - RLS tests pass; - secret key tidak ada di client
bundle; - XSS payload tampil sebagai text/ditolak; - invalid
`javascript:` URL ditolak; - oversized/wrong-type upload ditolak; -
SQL-like input tidak mengubah query semantics; - auth/upload rate limit
diuji; - CSP tidak memblokir legitimate production assets; - dependency
audit direview; - error response tidak membocorkan secrets/internal
credentials.

## 22. Incident Basics

Jika secret bocor: rotate/revoke, redeploy, review logs dan policy
exposure. Jika content compromise terjadi: disable affected mutation
path, preserve logs, restore known-good content/data, patch root cause,
kemudian re-enable.


## 23. 3D Helicopter Asset Security

Helicopter merupakan external 3D asset yang dapat berasal dari asset library pada tahap implementasi.

Security requirements:
- gunakan asset dari source tepercaya dengan lisensi yang jelas;
- prefer asset yang disimpan pada controlled project storage/CDN setelah diverifikasi;
- jangan menjalankan script/code yang dibundel dari sumber asset;
- treat model metadata, filenames, material names, dan external references sebagai untrusted data;
- hindari runtime loading dari arbitrary user-provided URL;
- allowlist origin asset melalui CSP;
- jangan memasukkan secret/token ke URL asset;
- validasi ukuran dan format apabila CMS nantinya mengizinkan penggantian model;
- asset upload admin tetap mengikuti Storage RLS dan file-size/type restrictions.

Helicopter model hanya presentation asset dan tidak boleh memengaruhi authorization atau menentukan akses ke content.
