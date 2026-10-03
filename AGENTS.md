# AGENTS.md --- Implementation Rules for Coding Agents

## Mission

Implementasikan portfolio sesuai `PRD.md`, `DESIGN.md`,
`ARCHITECTURE.md`, dan `SECURITY.md`. Prioritas: correctness → security
→ accessibility → performance → visual fidelity.

## Non-Negotiable

1.  Positioning utama selalu **Software Engineer**.
2.  Normal Mode harus usable tanpa Three.js.
3.  Jangan load Three.js pada initial Normal Mode tanpa kebutuhan.
4.  Jangan hardcode content yang seharusnya berasal dari CMS.
5.  Jangan memasukkan foto/data project fiktif sebagai final content.
    Gunakan placeholder sampai user memberikan aset/data.
6.  Desktop, tablet, dan mobile wajib diperlakukan sebagai first-class.
7.  Jangan mengubah architecture monorepo tanpa alasan teknis yang
    terdokumentasi.
8.  Jangan expose Supabase secret/elevated key di browser.
9.  Semua exposed tables wajib mengikuti RLS/least-privilege policy.
10. Jangan menggunakan `dangerouslySetInnerHTML` untuk CMS content
    kecuali ada kebutuhan yang jelas dan sanitization yang tervalidasi.

## Coding Style

-   TypeScript strict.
-   Hindari `any`; jika terpaksa, beri alasan.
-   Small cohesive components/functions.
-   Feature-based structure.
-   Shared code hanya dipindahkan ke package jika benar-benar digunakan
    lintas app.
-   Jangan membuat abstraction hanya untuk satu pemakaian sederhana.
-   Naming eksplisit.
-   Comments menjelaskan **why**, edge case, security/performance
    reasoning; jangan mengomentari syntax yang sudah jelas.
-   No dead code / commented-out implementation.

## UI Rules

-   Ikuti DESIGN.md.
-   Normal Mode sederhana dan calm.
-   Interactive world tidak boleh mengambil alih UX normal.
-   Selalu sediakan Exit/Normal Mode.
-   Tidak ada aggressive motion.
-   DOM overlay untuk readable project/experience details.
-   Respect reduced motion dan keyboard focus.

## Responsive Rules

Test minimal: - 360px mobile; - 390/430px mobile; - 768/820px tablet; -
1024px tablet/desktop boundary; - 1366/1440px desktop; - 1920px FHD; -
2560px QHD; - sanity check 3840px.

Jangan memperbaiki responsive dengan hardcoded offsets per-device.
Gunakan layout constraints, grid/flex, `clamp()`, min/max, container
strategy, dan media queries yang meaningful.

## Three.js Rules

-   dynamic import;
-   optimized assets;
-   no huge world;
-   free-roam WASD/touch;
-   proximity system terpisah dari presentation;
-   no hard camera snap;
-   adaptive quality;
-   clean up listeners, geometries, materials, textures;
-   avoid render-loop React state updates;
-   profile before adding expensive effects.

## Data Rules

-   Validate CMS mutation payloads.
-   Published/unpublished state selalu dihormati.
-   Public app tidak boleh dapat mutation privilege.
-   Shared types tidak menggantikan runtime validation.
-   Database migrations dan RLS policy changes harus committed.

## Security Rules

Baca `SECURITY.md` sebelum membuat auth, storage, API/server function,
rich text, atau database changes.

Jangan: - trust client authorization; - concatenate user input ke SQL; -
render unsanitized HTML; - expose secret key; - log token/password; -
accept arbitrary upload type/size; - disable RLS untuk menyelesaikan
bug; - membuat permissive policy seperti write `using (true)` untuk
public roles.

## SEO Rules

-   Semua important content tersedia di Normal Mode.
-   Set unique metadata untuk project detail.
-   Satu logical H1 per page.
-   Semantic heading order.
-   Meaningful anchor text.
-   Images punya dimensions dan alt.
-   Interactive mode tidak menjadi satu-satunya URL untuk sebuah
    project.

## Definition of Done

Task belum selesai sampai: - lint/typecheck pass; - relevant tests
pass; - responsive behavior diperiksa; - accessibility dasar
diperiksa; - loading/error/empty states ada; - security impact
diperiksa; - tidak ada regression pada Normal Mode; - performance impact
Three.js dipertimbangkan; - documentation diperbarui jika
contract/architecture berubah.


## Helicopter Implementation Rules
- Player vehicle Interactive Mode adalah **helicopter**, bukan flying car.
- Jangan mengganti vehicle type tanpa perubahan requirement eksplisit.
- Jangan membangun realistic helicopter simulator.
- Prioritaskan predictable casual controls dan accessibility.
- Gunakan third-person follow camera yang smooth dan horizon-friendly.
- Jangan menambahkan camera shake, rotor vibration camera effect, aggressive banking, motion blur, atau forced cinematic movement.
- Helicopter tidak perlu landing presisi untuk berinteraksi dengan Project/Experience Point.
- Interaction tetap berdasarkan proximity system.
- Pisahkan input, movement, camera, model, animation, dan proximity logic.
- Jangan membuat model helicopter dari procedural high-poly geometry jika optimized GLB/GLTF lebih tepat.
- Selama asset final belum diberikan/dipilih, gunakan placeholder development asset/geometry dan jangan menganggapnya sebagai final design.
- Rotor animation harus murah dan tidak menyebabkan render-loop React state updates.
- Uji flight controls pada keyboard/mouse dan touch.
- Selalu sediakan cara reset/recenter jika player keluar bounds atau kontrol menjadi tidak nyaman.
