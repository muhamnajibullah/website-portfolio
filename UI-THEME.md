# UI-THEME.md --- Portfolio Theme System

## 1. Theme Direction

Portfolio menggunakan visual yang **soft, modern, calm, professional,
dan technical**.

Theme yang wajib tersedia: - **Dark Mode --- default** - Light Mode -
manual theme toggle - persistent user preference

Default pertama selalu `dark`. Setelah user mengganti theme secara
manual, simpan pilihan tersebut (misalnya `portfolio-theme`) dan gunakan
kembali pada kunjungan berikutnya.

## 2. Core Palette

  Token         Hex         Description
  ------------- ----------- ----------------------------
  Deep Forest   `#051f20`   Hijau gelap pekat
  Dark Forest   `#0b2b26`   Hijau tua
  Moss Dark     `#133532`   Hijau lumut tua
  Forest Teal   `#235347`   Hijau hutan / teal gelap
  Sage          `#8eb69b`   Hijau sage / pastel medium
  Mint          `#daf1de`   Hijau mint sangat muda

Palette ini menjadi brand foundation. Neutral white/off-white tetap
boleh digunakan sebagai supporting surface pada Light Mode.

## 3. Dark Mode --- Default

Recommended semantic mapping:

``` css
:root,
[data-theme="dark"] {
  color-scheme: dark;

  --color-bg: #051f20;
  --color-bg-subtle: #0b2b26;

  --color-surface: #0b2b26;
  --color-surface-elevated: #133532;
  --color-surface-interactive: #235347;

  --color-border: #235347;

  --color-text: #daf1de;
  --color-text-secondary: #8eb69b;

  --color-primary: #8eb69b;
  --color-primary-hover: #daf1de;
  --color-on-primary: #051f20;

  --color-focus: #8eb69b;
}
```

Gunakan `#051f20` sebagai dominant background. `#0b2b26` dan `#133532`
untuk section/card hierarchy. `#235347` untuk border dan interactive
surfaces. `#daf1de` menjadi primary readable foreground, sedangkan
`#8eb69b` menjadi secondary/accent.

Dark Mode harus tetap terlihat seperti portfolio profesional, bukan
gaming dashboard. Hindari neon/glow berlebihan.

## 4. Light Mode

``` css
[data-theme="light"] {
  color-scheme: light;

  --color-bg: #daf1de;
  --color-bg-subtle: #f4faf5;

  --color-surface: #ffffff;
  --color-surface-elevated: #daf1de;
  --color-surface-interactive: #8eb69b;

  --color-border: #8eb69b;

  --color-text: #051f20;
  --color-text-secondary: #235347;

  --color-primary: #235347;
  --color-primary-hover: #133532;
  --color-on-primary: #daf1de;

  --color-focus: #235347;
}
```

Light Mode bukan hasil `filter: invert()`. Setiap semantic token harus
memiliki mapping sendiri.

## 5. Semantic Token Rule

Component jangan menyebarkan raw hex seperti:

``` text
bg-[#051f20]
text-[#daf1de]
```

ke seluruh codebase.

Raw palette didefinisikan satu kali sebagai primitive/design tokens
kemudian dipetakan menjadi semantic tokens:

``` text
background
background-subtle
surface
surface-elevated
foreground
muted-foreground
primary
primary-hover
on-primary
border
focus-ring
```

Ini membuat Dark/Light Mode mudah dipelihara.

## 6. Hero

Dark: - background `#051f20` - heading `#daf1de` - secondary copy
`#8eb69b` - primary CTA `#8eb69b` dengan foreground `#051f20`

Light: - soft mint/off-white background - heading `#051f20` - secondary
copy `#235347` - primary CTA `#235347` dengan foreground `#daf1de`

Foto pribadi harus tetap natural. Jangan menerapkan green filter kuat
pada wajah hanya agar mengikuti palette.

## 7. Cards

Dark: - default `#0b2b26` - elevated `#133532` - subtle hover toward
`#235347`

Light: - default white - secondary/elevated `#daf1de` - subtle sage
hover

Gunakan tonal elevation + border. Hindari shadow berat, terutama pada
Dark Mode.

## 8. Buttons

Dark primary:

``` text
Background : #8eb69b
Text       : #051f20
Hover      : #daf1de
```

Light primary:

``` text
Background : #235347
Text       : #daf1de
Hover      : #133532
```

Secondary button menggunakan transparent/subtle surface dan border.

## 9. Theme Toggle

Navbar public portfolio dan CMS menyediakan theme toggle yang
accessible.

Behavior:

``` text
Dark ↔ Light
```

Gunakan Sun/Moon icon dengan accessible label: -
`Switch to light mode` - `Switch to dark mode`

Jangan mengandalkan icon tanpa accessible name.

## 10. Theme Persistence & Flash Prevention

Manual preference disimpan di browser storage karena bukan data
sensitif.

Priority:

``` text
1. Saved user preference
2. Application default: dark
```

Terapkan theme sedini mungkin agar tidak terjadi white flash sebelum
Dark Mode aktif.

System theme dapat menjadi optional `System` mode di masa depan, tetapi
tidak menggantikan requirement bahwa first/default experience adalah
Dark Mode.

## 11. Mini-game / Three.js

Interactive Mode tetap memakai identity yang sama:

-   dark forest/teal environment;
-   muted surfaces;
-   sage/mint interaction markers;
-   no bright neon-green world;
-   readability tetap tinggi.

Point states:

``` text
Idle       → #235347
Discovery  → #8eb69b
Focus      → stronger #8eb69b
Interact   → #daf1de
```

Emissive/bloom hanya subtle.

## 12. Helicopter & HUD

Helicopter tidak wajib seluruhnya berwarna hijau. Palette dapat
digunakan untuk accent stripe, HUD, markers, dan interaction indicator.
Model harus tetap memiliki separation yang jelas dari environment.

Dark HUD:

``` text
Surface → #0b2b26 / #133532
Text    → #daf1de
Accent  → #8eb69b
```

HUD harus minimal dan tidak menutupi viewport.

## 13. Theme Transition

Theme transition boleh subtle, sekitar `150–250ms`, hanya untuk: -
background-color - color - border-color - fill - stroke

Jangan gunakan `transition: all`.

Respect `prefers-reduced-motion`.

## 14. Images & Screenshots

Jangan recolor project screenshots atau foto pribadi. Warna portfolio
diterapkan pada surrounding UI, frame, caption, border, dan background.

## 15. Accessibility

Accessibility mengalahkan keinginan mempertahankan kombinasi warna
tertentu.

Periksa: - text/background contrast; - links; - focus states; - hover; -
disabled state; - Dark Mode; - Light Mode.

Focus ring Dark menggunakan `#8eb69b`/`#daf1de`; Light menggunakan
`#235347`.

Jangan menghapus native focus tanpa replacement.

## 16. CMS

CMS juga mendukung Dark/Light dan default Dark.

CMS lebih utilitarian daripada public portfolio. Prioritaskan
readability form/table/status.

Semantic status boleh memakai warna di luar brand palette bila
diperlukan: - error → accessible red - warning → accessible amber -
success → portfolio green - info → accessible blue

Jangan membuat error hijau hanya demi konsistensi brand.

## 17. Implementation Instructions

Coding agent wajib: 1. menggunakan Dark Mode sebagai default; 2.
menyediakan Light Mode; 3. memakai semantic tokens; 4. tidak menyebarkan
hardcoded hex pada components; 5. menyimpan manual preference; 6.
mencegah theme flash sejauh architecture memungkinkan; 7. menguji semua
component di kedua theme; 8. menjaga contrast/accessibility; 9. respect
reduced motion; 10. menjaga Mini-game Mode konsisten dengan Normal Mode;
11. menjaga foto/screenshots natural; 12. tidak menambahkan primary
brand color baru tanpa kebutuhan terdokumentasi.

## 18. Definition of Done

UI dianggap selesai jika: - Dark Mode tampil benar dan menjadi
default; - Light Mode tampil benar; - toggle bekerja; - preference
bertahan setelah refresh; - tidak ada flash theme mencolok; -
hover/focus/disabled state tersedia; - readable dan responsive; -
keyboard accessible; - semantic tokens digunakan; - Three.js/HUD tetap
konsisten dengan palette.
