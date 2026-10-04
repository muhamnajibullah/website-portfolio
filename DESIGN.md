# DESIGN.md --- Visual & Interaction Specification

## 1. Reference Interpretation

Referensi utama: `https://amix-design.com/tl/web-g-threejs/`.

Referensi dipakai untuk memahami **spatial exploration / interactive
gallery**, bukan untuk disalin secara visual atau dibuat sama beratnya.
Portfolio ini harus lebih tenang, ringan, profesional, dan nyaman untuk
user non-gamer.

## 2. Design Personality

Keywords: soft, modern, calm, technical, spacious, professional, subtle,
memorable.

Normal Mode tidak boleh terlihat seperti game. Interactive Mode boleh
playful, tetapi tetap konsisten dengan identitas portfolio Software
Engineer.

Hindari neon berlebihan, blur/glass berat, excessive particles,
continuous animation di semua section, kontras ekstrem, dan visual
clutter.

## 3. Normal Mode

Struktur:
`Navbar → Hero → About → Featured Projects → Tools → Experience → Interactive CTA → Contact → Footer`.

Hero menggunakan area foto pribadi yang jelas. Sampai foto diberikan,
gunakan placeholder dengan aspect ratio yang stabil agar layout tidak
berubah saat aset final dimasukkan.

Gunakan semantic tokens dan palette forest pada `UI-THEME.md`. Dark Mode
menjadi default, Light Mode tersedia melalui toggle public/CMS dengan
preferensi tersimpan. Tonal surfaces, subtle borders, dan sage/mint accent
menjaga tampilan calm dan readable pada kedua theme.

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
underline navigation, tonal card hover, dan entrance pendek pada hero/dialog.
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

Saat interact, detail ditampilkan menggunakan DOM overlay/bottom sheet,
bukan seluruh informasi sebagai 3D text.

Project overlay: - title; - image; - short description; - role; -
technologies; - View Full Project; - Continue Exploring.

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
sheet/full-screen sheet; - lower default graphical quality.

Tablet: - touch-first controls; - portrait + landscape; - adaptive
HUD; - 1--2 column normal content.

Desktop: - WASD + mouse; - readable max-width normal content; - 3D
viewport menggunakan ruang secara efektif.

2K/4K: - jangan stretch cards/text; - gunakan max-width, fluid spacing,
background composition, dan controlled scale.

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
