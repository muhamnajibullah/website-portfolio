# ARCHITECTURE.md --- Monorepo Architecture

## 1. Architecture Goals

-   sederhana untuk personal portfolio;
-   scalable tanpa premature microservices;
-   clear separation antara public web, CMS, shared code, Supabase, dan
    Three.js;
-   fast deployment via Vercel;
-   secure by default;
-   content-driven;
-   3D code tidak membebani Normal Mode.

## 2. Monorepo

Gunakan `pnpm` workspaces + Turborepo.

``` text
portfolio/
├─ apps/
│  ├─ web/                 # public portfolio
│  └─ cms/                 # authenticated content management
├─ packages/
│  ├─ ui/                  # shared UI primitives
│  ├─ types/               # domain/API types
│  ├─ validation/          # shared schemas
│  ├─ supabase/            # typed client factories/repositories
│  ├─ config/              # shared TS/lint/config
│  └─ seo/                 # metadata/schema helpers
├─ supabase/
│  ├─ migrations/
│  ├─ seed.sql
│  └─ tests/
├─ docs/
│  ├─ PRD.md
│  ├─ DESIGN.md
│  ├─ ARCHITECTURE.md
│  ├─ AGENTS.md
│  └─ SECURITY.md
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

Three.js feature tetap berada di
`apps/web/src/features/interactive-world/` agar hanya public app yang
memuatnya.

## 3. Web App

Suggested feature structure:

``` text
src/
├─ app/
├─ components/
├─ features/
│  ├─ profile/
│  ├─ projects/
│  ├─ technologies/
│  ├─ experiences/
│  ├─ contact/
│  └─ interactive-world/
│     ├─ scene/
│     ├─ entities/
│     ├─ controls/
│     ├─ systems/
│     ├─ points/
│     ├─ hud/
│     ├─ hooks/
│     └─ utils/
├─ lib/
├─ services/
├─ styles/
└─ types/
```

Interactive module harus dynamic imported.

## 4. CMS App

``` text
src/features/
├─ auth/
├─ dashboard/
├─ profile/
├─ projects/
├─ experiences/
├─ technologies/
├─ interactive-points/
├─ media/
└─ settings/
```

CMS dan public app berbagi domain types/validation, bukan copy-paste.

## 5. Supabase Data Model

Core tables: - profiles - projects - project_media - technologies -
technology_categories - project_technologies - work_experiences -
experience_technologies - interactive_points - social_links -
site_settings - media_metadata - admin_profiles / roles bila diperlukan

`interactive_points` menghubungkan project/experience ke spatial data
seperti x/y/z, rotation, marker type, discovery/focus/interaction
radius, dan enabled state.

Public visitor hanya membaca **published public fields**. CMS
authenticated admin mendapat operasi sesuai policy.

## 6. Data Access

Gunakan repository/service layer kecil di shared Supabase package.
Jangan menyebar raw queries di seluruh component.

Flow: `UI → feature hook/query → repository → Supabase`.

TanStack Query menangani async cache/server state bila memberi manfaat.
Jangan gunakan untuk static/local UI state.

## 7. Auth

Public web tanpa login. CMS memakai Supabase Auth. Route guard di UI
hanya UX layer; authorization sebenarnya tetap ditegakkan oleh
RLS/database policies.

## 8. Storage

Buckets dipisahkan secara logis, misalnya `public-media` dan
private/admin-only bila dibutuhkan. Public media hanya untuk aset yang
memang boleh dipublikasikan. Upload dari CMS divalidasi type, size,
ownership/path, dan policy.

## 9. Vercel

Deploy `apps/web` dan `apps/cms` sebagai dua Vercel projects dari
monorepo, misalnya: - production portfolio domain; - `cms.<domain>` atau
protected admin domain.

Gunakan Preview Deployments untuk PR. Environment variables terpisah
Development/Preview/Production.

Public client hanya menerima Supabase publishable key. Secret/elevated
key hanya boleh berada di trusted server environment bila benar-benar
dibutuhkan.

## 10. SEO Architecture

Normal content harus server/prerender-friendly sesuai framework strategy
yang dipilih. Jika Vite SPA murni membuat SEO project detail kurang
ideal, implementasi boleh menambahkan prerender/SSG strategy atau
mengevaluasi framework rendering tanpa mengubah product behavior.

Required outputs: - semantic HTML; - unique metadata per route; -
canonical; - sitemap; - robots; - OG metadata/images; - JSON-LD
relevan; - stable project slugs; - descriptive internal links.

Three.js routes/content tidak menjadi canonical replacement untuk normal
project pages.

## 11. Performance Architecture

Budgets: - initial route tidak mengimpor Three.js; - 3D textures/models
dipisah dari critical bundle; - image dimensions selalu diketahui; -
responsive formats; - cache immutable versioned assets; - lazy-load
noncritical sections/assets; - avoid global state untuk data yang tidak
global.

Measure bundle size dan Web Vitals pada production builds.

## 12. Error Boundaries

Pisahkan failure domain: - normal page; - CMS; - interactive world.

Three.js crash tidak boleh meruntuhkan seluruh web app. Sediakan
fallback boundary menuju Normal Mode.

## 13. CI/CD

Minimum checks sebelum production: - install locked dependencies; -
lint; - typecheck; - unit tests; - build web; - build CMS; -
security/dependency audit sesuai tooling; - database migration review; -
RLS policy tests; - optional Lighthouse/performance regression check.

## 14. Environments

`local → preview/staging → production`.

Database migrations harus version-controlled. Jangan melakukan perubahan
schema production manual tanpa migration yang direkam.


## 15. Helicopter System Architecture

Interactive world menggunakan entity `HelicopterPlayer`.

Suggested separation:

```text
interactive-world/
├─ entities/
│  └─ helicopter/
│     ├─ Helicopter.tsx
│     ├─ HelicopterModel.tsx
│     └─ RotorAnimation.ts
├─ controls/
│  ├─ desktopFlightControls.ts
│  └─ touchFlightControls.ts
├─ systems/
│  ├─ flightMovement.ts
│  ├─ followCamera.ts
│  ├─ proximitySystem.ts
│  └─ worldBounds.ts
└─ assets/
```

Pisahkan:
- input;
- flight state/movement;
- model presentation;
- rotor animation;
- follow camera;
- proximity detection.

Jangan mengikat business content ke helicopter component.

### Flight Model
Gunakan lightweight arcade movement, bukan full rigid-body helicopter simulation kecuali kemudian terbukti diperlukan. Ini mengurangi dependency, CPU cost, complexity, dan motion instability.

Frame-rate independent movement menggunakan delta time. Clamp velocity/altitude dan batasi world bounds.

### Asset Loading
Helicopter model menggunakan optimized GLB/GLTF ketika final asset tersedia. Load hanya setelah Interactive Mode dipilih.

Pipeline asset harus mempertimbangkan:
- mesh/poly count;
- texture resolution;
- texture compression bila tersedia;
- mesh compression bila sesuai;
- animation count;
- file size;
- disposal/caching.

Rotor animation sebisa mungkin sederhana dan tidak memerlukan physics simulation.

### Fallback
Jika helicopter model gagal dimuat tetapi scene masih dapat berjalan, sistem boleh menggunakan lightweight fallback representation agar user tetap dapat menjelajah. Jika interactive runtime secara keseluruhan gagal, arahkan ke Normal Mode.
