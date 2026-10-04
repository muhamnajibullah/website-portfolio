# DESIGN.md --- Visual & Interaction Specification

## 1. Reference Interpretation

Sumber visual terbaru: [UI-UX-REVISION-DRIBBBLE.md](UI-UX-REVISION-DRIBBBLE.md).
Dokumen tersebut mengalahkan pedoman visual sebelumnya, termasuk
`UI-THEME.md`. Referensi FleexStudio di Dribbble digunakan untuk komposisi
editorial, bukan salinan pixel-perfect.

Referensi `https://amix-design.com/tl/web-g-threejs/` tetap membantu memahami
**spatial exploration / interactive gallery**. Requirement helicopter,
performance, CMS, accessibility, SEO, dan security tetap berlaku.

## 2. Design Personality

Keywords: dark editorial, technical, spacious, professional, high contrast,
oversized typography, large imagery, thin separators.

Normal Mode tidak boleh terlihat seperti game. Interactive Mode boleh
playful, tetapi tetap konsisten dengan identitas portfolio Software
Engineer.

Hindari neon berlebihan, blur/glass berat, excessive particles,
continuous animation di semua section, cyan glow berlebihan, dan visual
clutter.

## 3. Normal Mode

Struktur:
`Navbar → Hero → About → Selected Projects → Work Experience → Tools → Interactive CTA → Contact → Footer`.

Hero menggunakan area foto pribadi yang jelas. Sampai foto diberikan,
gunakan placeholder dengan aspect ratio yang stabil agar layout tidak
berubah saat aset final dimasukkan.

Gunakan neutral dark `#0A0A0A`, off-white `#F3F3F0`, dan brand cyan
`#00D1D1`. Light Mode memakai neutral `#F5F5F1` dan semantic cyan yang lebih
gelap untuk contrast teks/control. Primitive → semantic token → component
token dibagi public, CMS, HUD, dan adapter material Three.js. Dark menjadi
default, toggle public/CMS menyimpan preferensi dan bootstrap theme berjalan
sebelum React.

Hero menonjolkan dua baris **Software Engineer**, nama/statement CMS, dan
portrait dengan aspect ratio stabil. About memakai split composition.
Projects memakai numbered showcase, featured visual besar, dan susunan
alternating; problem, solusi dan tools tetap terlihat. Experience berupa
timeline/list dengan separators, tools dikelompokkan berdasarkan kategori.
CTA interactive memakai cyan lebih kuat tanpa memuat Three.js.

Project yang ditandai Featured mendapat prioritas, lalu CMS sort order.
Semua published projects berada dalam satu showcase; entry pertama memakai
visual besar walaupun belum ada flag Featured. Empty state hanya tampil
ketika belum ada published project.

Desktop navigation: name/mark, Projects, Experience, About, Mini game,
theme. Mobile memakai header compact dan large-sheet navigation melalui
shared dialog; keyboard, resize, dan perpindahan menu → intro memulihkan
focus/scroll. Buttons berbentuk rectangular dengan radius kecil.

Project detail memakai hero/cover besar, overview, role/timeline/stack,
problem, engineering approach, key features, technical challenges,
solution, screenshots, outcome, dan next project. Reading width dibatasi;
field opsional ditampilkan hanya jika diisi melalui CMS. Screenshot/foto
mempertahankan warna asli, dimensions dan alt; tidak difilter atau diberi
cyan overlay.

Typography maksimal 1--2 families, readable, fluid dengan `clamp()`, dan
tidak membesar berlebihan pada 2K/4K.

## 4. Interactive Entry

Mini-game tidak autoplay di landing page.

CTA `Explore in 3D` / `Start the 3D tour` membuka lightweight intro:
`Explore the portfolio in 3D`, petunjuk keyboard/touch, `Enter world`,
dan `Stay on the portfolio`. World memakai tombol `Back to portfolio`.

Assets 3D dimuat setelah intent user jelas.

Intro, world, dan dialog detail/settings memakai shared scroll lock.
Saat kembali ke Normal Mode, pulihkan posisi scroll dan fokus pada CTA
yang membuka world, termasuk CTA di bawah halaman. Lock dialog nested
tidak boleh melepas lock world atau membuat halaman terkunci setelah exit.

Semua popup aplikasi memakai shared native `Dialog`, termasuk konfirmasi
hapus CMS. Popup berada di tengah viewport pada kedua sumbu, dengan batas
tinggi viewport dan scroll di dalam popup untuk konten panjang. Fokus
keyboard tetap berada di popup dan kembali ke tombol asal setelah ditutup.
Konfirmasi hapus tidak dapat ditutup saat permintaan hapus sedang berjalan.

Copy antarmuka memakai Bahasa Inggris sederhana: tombol menjelaskan aksi,
empty states menjelaskan konten yang belum tersedia, dan pesan error memberi
langkah berikutnya. Konten profil/project tetap berasal dari CMS.

Interaction feedback menggunakan hover/press tombol, pergerakan ikon,
underline navigation, border reveal, image scale maksimal 1.02, dan entrance
pendek pada hero/dialog.
Motion tidak berjalan terus-menerus; reduced motion menonaktifkan entrance
dan transform feedback. Transisi warna theme sekitar 200ms.

## 5. Free-Roam World

Tidak menggunakan linear navigation. User bebas berjalan ke area mana
pun.

Contoh spatial layout:

```text
             [PROJECT B]
                  ●

 [EXPERIENCE A]  ●      ● [PROJECT C]

              PLAYER

        ● [PROJECT A]
```

World harus compact. Hindari map sangat luas yang membuat user berjalan
lama tanpa menemukan konten.

## 6. Proximity UX

Tiga zona:

**Discovery Radius** --- subtle marker/hint terlihat.\
**Focus Radius** --- label dan visual point lebih jelas; optional gentle
camera attention.\
**Interaction Radius** --- CTA aktif.

Camera tidak melakukan hard snap. User tetap mengendalikan
movement/camera. Jika camera assist digunakan, gunakan easing kecil dan
langsung berhenti jika user memberi input.

## 7. Project / Experience Focus

Saat interact, detail ditampilkan menggunakan DOM dialog di tengah viewport,
bukan seluruh informasi sebagai 3D text.

Project overlay: - title; - image; - short description; - role; -
technologies; - problem/solusi; - Read full project; - Continue exploring.

World memakai charcoal/neutral dan helicopter neutral, dengan marker idle
neutral, discovery low-opacity cyan, focus cyan, dan interaction cyan + CTA
yang readable. HUD mengikuti typography/borders/radius kecil website;
tidak ada shader, bloom, camera motion atau render-loop React state baru.

Experience overlay: - organization; - position; - period; -
summary/impact; - technologies; - related project optional.

## 8. Camera & Motion Comfort

Default: - moderate walking speed; - smooth acceleration/deceleration; -
conservative camera sensitivity; - moderate FOV; - no head bob; - no
camera shake; - no motion blur; - no auto-spin; - no forced rapid
rotation; - no flashing; - no unnecessary jumping mechanic.

Settings: Camera Sensitivity, Quality Auto/Low/Medium/High, Sound toggle
jika sound ditambahkan, Exit Interactive Mode.

Respect `prefers-reduced-motion`.

## 9. Mobile & Tablet

Mobile: - virtual joystick kiri; - drag camera kanan; - interaction
button besar; - safe-area aware HUD; - overlay sebagai bottom
dialog di tengah viewport dengan internal scroll; - lower default graphical quality.

Tablet: - touch-first controls; - portrait + landscape; - adaptive
HUD; - 1--2 column normal content.

Desktop: - WASD + mouse; - readable max-width normal content; - 3D
viewport menggunakan ruang secara efektif.

2K/4K: - jangan stretch cards/text; - gunakan max-width, fluid spacing,
background composition, dan controlled scale.

Responsive checks: 360/390/430/768/820/1024/1280/1366/1440/1536/1920/2560/3840px,
ditambah tablet landscape. Layout memakai constraints, grid/flex dan clamp(),
bukan offsets per-device.

## 10. Loading & Failure

Interactive loading harus menunjukkan progress sederhana dan tombol
`View Normal Portfolio`.

Jika WebGL/scene gagal:
`Interactive experience couldn't be loaded. View the normal portfolio instead.`

Jangan pernah blank screen.

## 11. Visual Performance Rules

- low-poly / optimized geometry;
- compressed textures;
- avoid large transparent layers;
- baked/simple lighting jika cocok;
- limited real-time shadows;
- no unnecessary post-processing;
- instancing/reuse untuk repeated objects;
- adaptive DPR;
- LOD hanya bila memberi manfaat nyata;
- dispose resources;
- stop/pause render work ketika world tidak aktif.

## 12. Accessibility

Semua informasi 3D mempunyai equivalent Normal Mode. Alt text berasal
dari CMS. Interactive UI dapat dioperasikan tanpa bergantung pada warna
saja. Focus state jelas. Touch target nyaman. User selalu dapat keluar
dari mini-game.

## 13. Helicopter Player Design

Interactive world menggunakan **helicopter** sebagai kendaraan utama.

Arah desainnya bukan helicopter simulator. Pengalaman harus terasa seperti casual exploration:

```text
             PROJECT AREA
                  ●
             focus radius

                  ↑
             🚁 HELICOPTER
            free exploration
```

### Camera

Default camera menggunakan third-person chase/follow camera sehingga helicopter terlihat dan user memiliki spatial awareness yang baik.

Camera harus:

- mengikuti helicopter dengan smoothing;
- menjaga horizon relatif stabil;
- tidak menempel terlalu dekat;
- tidak melakukan hard snap;
- tidak ikut menghasilkan getaran rotor;
- menggunakan collision/obstruction handling sederhana bila diperlukan.

Optional camera recenter dapat tersedia.

### Flight Controls

Desktop concept:

- `W/S` — forward/backward;
- `A/D` — turn/strafe sesuai hasil usability test;
- mouse — camera/look;
- tombol altitude up/down yang mudah dijangkau;
- `E` — interact ketika berada di interaction radius.

Final mapping harus diuji agar lebih nyaman daripada mengejar realisme.

Mobile:

- virtual movement control;
- camera drag;
- altitude controls;
- interaction button;
- recenter/reset button bila diperlukan.

### Animation

Rotor boleh berputar secara visual, tetapi:

- tidak menggunakan motion blur berat;
- tidak menimbulkan flashing;
- tidak menghasilkan camera vibration;
- animation cost harus rendah.

### Environment Scale

Ukuran bangunan, marker, dan jarak antar-area harus disesuaikan dengan skala helicopter. World tetap compact agar user tidak harus terbang lama untuk menemukan project.

### Visual Asset Strategy

MVP menggunakan **primitive-first environment**. Model kompleks hanya digunakan jika memberikan nilai visual yang nyata.

Helicopter adalah salah satu aset 3D utama dan dapat menggunakan optimized GLB/GLTF. Tidak ada requirement bahwa pemilik portfolio harus membuat model 3D sendiri.
