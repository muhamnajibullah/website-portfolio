# UI-UX-REVISION.md --- Personal Portfolio Redesign

## 1. Source of Truth

Dokumen ini menggantikan arah visual public portfolio sebelumnya.
Referensi visual utama adalah Personal Portfolio Website dari
FleexStudio di Dribbble. Gunakan sebagai inspirasi komposisi dan art
direction, bukan pixel-perfect copy.

Requirement non-visual sebelumnya tetap berlaku: Software Engineer
positioning, CMS, Vercel + Supabase, SEO, responsive design, optional
Three.js mini-game dengan helicopter, performance, accessibility, dan
security.

## 2. Revised Identity

Arah baru: - dark editorial portfolio - oversized typography - strong
visual hierarchy - spacious composition - large personal/project
imagery - minimal navigation - thin separators - high contrast - accent
cyan `#00D1D1`

Jangan gunakan lagi forest-green/sage sebagai primary visual identity.
Hijau stabilo/lime pada referensi diganti dengan `#00D1D1`.

Hindari generic SaaS cards, excessive glassmorphism, cyberpunk neon,
cyan glow berlebihan, gradient berlebihan, dan terlalu banyak
rounded/pill components.

## 3. Brand Positioning

Professional title tetap **Software Engineer**. Visual boleh
kreatif/editorial tetapi copy harus menonjolkan engineering, selected
projects, technologies, work experience, dan technical contribution.

## 4. Dark Mode --- Default

``` css
:root,
[data-theme="dark"] {
  color-scheme: dark;
  --background: #0A0A0A;
  --background-secondary: #111111;
  --surface: #141414;
  --surface-elevated: #191919;
  --foreground: #F3F3F0;
  --foreground-secondary: #A7A7A2;
  --foreground-muted: #777773;
  --border: #292929;
  --border-strong: #3A3A3A;
  --accent: #00D1D1;
  --accent-hover: #24E0E0;
  --accent-muted: rgba(0, 209, 209, .12);
  --on-accent: #071010;
}
```

Cyan digunakan untuk CTA, active navigation, underline, focus ring,
metadata penting, Three.js marker, dan decorative highlights secara
terkontrol. Jangan membuat seluruh section cyan.

## 5. Light Mode

``` css
[data-theme="light"] {
  color-scheme: light;
  --background: #F5F5F1;
  --background-secondary: #ECECE7;
  --surface: #FFFFFF;
  --surface-elevated: #F0F0EB;
  --foreground: #101010;
  --foreground-secondary: #50504D;
  --foreground-muted: #777773;
  --border: #D7D7D1;
  --border-strong: #BDBDB7;
  --accent: #00AFAF;
  --accent-hover: #008F8F;
  --accent-muted: rgba(0, 175, 175, .10);
  --on-accent: #FFFFFF;
}
```

Brand accent tetap berasal dari `#00D1D1`, tetapi darker semantic cyan
boleh digunakan pada Light Mode agar contrast accessible.

Default pertama selalu Dark. Priority: saved user preference → Dark
default. Sediakan toggle Dark/Light dan cegah theme flash sejauh
architecture memungkinkan.

## 6. Global Layout

Gunakan full-width editorial composition dengan controlled content grid
dan generous negative space.

Urutan:
`Navbar → Hero → About → Selected Projects → Work Experience → Tools → Interactive CTA → Contact → Footer`

Jangan bungkus setiap section dalam floating card. Typography, imagery,
whitespace, dan separators menjadi hierarchy utama.

## 7. Navigation

Desktop direction:
`NAME/MARK | PROJECTS | EXPERIENCE | ABOUT | MINI GAME | THEME`

Navigation minimal, dapat sticky/fixed, dan active state menggunakan
cyan secara subtle. MINI GAME boleh menjadi CTA khusus. Mobile
menggunakan compact header + theme toggle + menu trigger dan clean
full-screen/large-sheet navigation.

## 8. Hero

Hero adalah visual statement utama. Gunakan oversized responsive
typography seperti:

``` text
SOFTWARE
ENGINEER
```

Sertakan nama, short professional statement, CTA, dan personal portrait.

Foto user diberikan saat implementasi. Sampai itu gunakan neutral
placeholder dengan aspect ratio final; jangan gunakan stock/fake
portrait.

Foto boleh berupa large editorial portrait/cutout/rectangular crop.
Jangan memberi cyan overlay kuat pada wajah.

Cyan digunakan pada satu kata, underline, CTA, indicator, atau
decorative line---bukan seluruh headline.

## 9. Typography

Gunakan maksimal satu display/grotesk family dan satu supporting family
jika perlu. Hero/section/project titles boleh oversized, body tetap
sangat readable. Gunakan `clamp()` dan batasi maximum scale untuk 2K/4K.

## 10. About

Gunakan editorial split composition:
`ABOUT | large statement / bio / supporting metadata`

Hindari card grid untuk bio. Optional content: current focus, location,
experience area.

## 11. Selected Projects

Project adalah visual showcase utama. Hindari uniform dashboard grid.

Gunakan featured project, alternating compositions, large imagery,
numbered entries, dan project metadata.

Example:

``` text
01
PROJECT NAME                         YEAR
[ LARGE PROJECT VISUAL ]
Role / Stack / short description      ↗
```

Screenshot mempertahankan warna asli project. Hover desktop hanya
subtle: image scale kecil, cyan arrow shift, underline, atau metadata
accent. Hindari dramatic 3D tilt.

## 12. Project Detail

Case-study structure:
`Project Hero → Overview → Role/Timeline/Stack → Problem → Engineering Approach → Key Features → Technical Challenges → Solution → Screenshots → Outcome → Next Project`

Gunakan full-width imagery dan controlled reading width. Halaman normal
tetap canonical/indexable dibanding versi mini-game.

## 13. Work Experience

Normal Mode menggunakan editorial timeline/list dengan thin separators:

``` text
2026 — NOW
COMPANY
Software Engineer
────────────────────────
```

Hover dapat memberi cyan highlight pada title/year. Seluruh experience
tetap dapat dibaca tanpa mini-game.

## 14. Tools & Technologies

Gunakan grouped text, compact icon grid, atau category-based layout.
Monochrome icon dapat berubah cyan pada hover. Jangan gunakan arbitrary
proficiency percentage.

## 15. Interactive CTA

Buat transisi kuat tetapi sederhana:

``` text
WANT TO EXPLORE DIFFERENTLY?

ENTER THE
INTERACTIVE WORLD →

Fly through my projects and experience.
```

Section ini boleh menggunakan cyan lebih kuat. Three.js belum boleh
dimuat hanya karena section terlihat; load setelah intent user.

## 16. Mini-game Revision

Requirement tetap: helicopter, free-roam, WASD desktop, touch mobile,
Project Points, Experience Points, Discovery/Focus/Interaction Radius.

Art direction baru: - dark neutral/charcoal world - off-white
typography - cyan `#00D1D1` untuk spatial guidance - minimal
exhibition/gallery feeling - bukan cyberpunk/action game

## 17. Helicopter

Helicopter menggunakan neutral dark/light body dengan optional cyan
accent. Tetap casual flight, third-person stable camera, no camera
shake, no rotor camera vibration, no heavy motion blur, no aggressive
banking, dan tidak perlu precision landing.

## 18. Interactive Markers

``` text
Idle        → subtle neutral
Discovery   → low-opacity cyan
Focus       → #00D1D1
Interaction → #00D1D1 + readable CTA
```

Bloom/glow sangat subtle.

## 19. Mini-game HUD

HUD mengikuti editorial website, bukan gaming HUD kompleks:

``` text
PROJECT NEARBY

HRIS SYSTEM
Software / Mobile / Web

[E] VIEW PROJECT
```

Gunakan dark panel, off-white text, cyan accent, thin border,
square/subtle radius. Mobile menggunakan contextual control/bottom
sheet.

## 20. Buttons

Dark primary: background `#00D1D1`, foreground `#071010`, hover
`#24E0E0`.

Secondary: transparent, off-white foreground, neutral border, subtle
cyan hover.

Gunakan rectangular/editorial shapes. Jangan menjadikan semua button
pill.

## 21. Microinteractions

Boleh: animated underline, arrow shift, border reveal, image scale
sekitar 1.00→1.02, subtle text transitions.

Hindari cursor trail berat, continuous floating, large parallax pada
semua section, magnetic effect di semua button, dan animation yang
mengganggu pembacaan.

## 22. Responsive

Mobile bukan desktop yang diperkecil. Gunakan single-column project
showcase, fluid hero typography, portrait yang tidak menutupi copy,
vertical timeline, large touch targets, dan tanpa horizontal overflow.

Tablet menggunakan hybrid 1--2 column dan diuji portrait/landscape.

Desktop diuji pada 1280, 1366, 1440, 1536, 1920, 2560 dan sanity check
3840. Gunakan max-width, fluid gutters, `clamp()`, controlled typography
maximum, dan full-bleed imagery bila sesuai.

## 23. Accessibility

Semantic HTML, visible focus, keyboard navigation, alt text, sufficient
contrast, touch-friendly controls, reduced motion, dan normal
alternative untuk Three.js wajib dipertahankan.

Jangan gunakan `#00D1D1` sebagai small text pada light background bila
contrast tidak cukup; gunakan darker semantic cyan.

## 24. Performance

Normal Mode: - no Three.js initial bundle - responsive optimized
images - AVIF/WebP bila sesuai - lazy-load below-fold media -
optimized/subset fonts - no large background video - reserve image
dimensions - selective animation only

Interactive Mode: - lazy load - optimized GLB/GLTF - compressed
textures - adaptive DPR - limited lights/shadows - minimal
post-processing - compact world - pause render work when inactive

Visual fidelity tidak boleh mengalahkan performance.

## 25. SEO

Redesign tidak mengubah SEO strategy. Profile, Software Engineer title,
projects, project details, experience, technologies, dan contact harus
tersedia sebagai crawlable Normal Mode HTML.

Pertahankan unique metadata, canonical, Open Graph, sitemap, robots,
semantic headings, structured data relevan, internal links, dan stable
project slugs. Three.js hanya alternative presentation.

## 26. CMS

CMS menggunakan visual tokens baru: dark default, neutral surfaces, cyan
accent, Light Mode tersedia. CMS tetap dashboard-oriented demi
usability; tidak perlu meniru editorial landing page secara literal.

Error/warning/info tetap menggunakan semantic accessible colors, bukan
dipaksa cyan.

## 27. Design Token Rule

Raw hex jangan tersebar di components.

Flow: `primitive color → semantic token → component token`

Contoh:
`#00D1D1 → accent → button-primary / active-link / focus-ring / project-marker`

Berlaku pada public web, CMS, dan Three.js HUD/material adapter.

## 28. Components to Redesign

Revisi berlaku untuk Navbar, Mobile Navigation, Hero, About, Section
Header, Project Showcase, Project Detail, Experience Timeline,
Technology section, Interactive CTA, Buttons, Links, Theme Toggle,
Contact, Footer, Loading/Error/Empty states, Mini-game Entry, Mini-game
HUD, dan Project/Experience Overlay.

Jangan hanya mengganti hijau menjadi cyan. Layout, typography, spacing,
hierarchy, imagery treatment, dan interaction language juga harus
direvisi.

## 29. Deprecated Visual Direction

Deprecated sebagai primary identity: - forest-green backgrounds -
sage/mint brand surfaces - green-dominant cards - previous green palette

Tetap pertahankan Dark Mode default, Light Mode, persistence, CMS,
responsive behavior, accessibility, SEO, security, Vercel/Supabase,
optional Three.js, helicopter, dan performance requirements.

New identity:
`Dark editorial neutral + off-white typography + #00D1D1 accent`

## 30. Agent Instructions

1.  Dokumen ini adalah source of truth visual terbaru.
2.  Jangan pixel-perfect clone reference.
3.  Positioning tetap Software Engineer.
4.  Dark default, Light Mode wajib.
5.  Accent utama `#00D1D1`.
6.  Cyan digunakan terkontrol.
7.  Prioritaskan typography/whitespace daripada decorative cards.
8.  Jangan load Three.js di Normal Mode.
9.  Jangan menambah animation berat untuk mengejar showcase effect.
10. Jangan gunakan stock portrait.
11. Project/foto final berasal dari user/CMS.
12. Pertahankan semantic HTML, SEO, responsive behavior, accessibility,
    reduced motion, performance, dan security.
13. Jika dokumen UI lama bertentangan dengan dokumen ini, **dokumen ini
    menang untuk keputusan visual/UI**.

## 31. Definition of Done

Redesign selesai jika public portfolio konsisten dengan dark editorial
direction baru, cyan menjadi accent utama, Dark/Light bekerja, Hero
memiliki hierarchy kuat, Projects menjadi visual showcase utama,
Experience/Tools konsisten, mini-game terasa sebagai bagian dari brand
yang sama tanpa menjadi cyberpunk, responsive mobile--4K, Normal Mode
tetap ringan, SEO/accessibility terjaga, dan foto pribadi dapat
dimasukkan kemudian tanpa redesign layout.
