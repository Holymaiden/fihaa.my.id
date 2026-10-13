# Dunia yang Hidup: Mode Jelajah, Rendering Sinematik, dan Interaksi

Branch: `claude/zen-ride-ntbnug` (bercabang dari `claude/clever-albattani-e7tn9x`, PR Holymaiden/fihaa.my.id#216 belum di-merge). Dasarnya umpan balik pemilik:

- dunia 3D masih terasa "template", kaku, jelek, dan tidak interaktif;
- referensi: https://jordan-breton.com/ (FWA of the Day). Di sana kita seperti benar-benar berada di dalam dunianya;
- pulau harus tetap bisa diputar seperti sekarang, tetapi juga bisa masuk ke sudut pandang orang pertama (POV);
- fitur yang diminta: cuaca, tur kamera 360°, musik fantasi, objek bergerak, pohon dan tanaman yang bergoyang tertiup angin, serta "pijakan" kursor di tanah dan rumput;
- prioritas rendering: IBL, *baked lighting*, *key light*, material PBR, ketidaksempurnaan, *color management* dan *tone mapping*, *post-processing*, serta kamera, komposisi, dan gerak.

## Tentang referensi

Repositori `jordan-breton/jordan-breton.com` hanya berisi hasil build, dan lisensinya **All rights reserved**: kode, shader, model, dan audio tidak boleh disalin. Yang saya lakukan hanya mempelajari tekniknya dari nama modul dan parameter. Semua implementasi di sini saya tulis sendiri, dan tidak ada aset dari situs itu yang dipakai.

Teknik yang saya pelajari dari referensi:
- viewpoint berupa posisi + arah, perjalanan kamera mengikuti kurva yang punya titik antara, dan ada tur otomatis;
- rumput dan bunga membaca **tekstur bending** yang dilukis oleh interaksi lalu memudar, sehingga jejak terlihat dan rumput pulih pelan-pelan;
- angin berasal dari noise di ruang dunia;
- tetes hujan di lensa kamera, TAA, *god rays*, awan volumetrik, dan pulau-pulau jauh di latar.

## Yang berubah

### 1. Dua mode kamera (+ tur)

| Mode | Cara masuk | Kontrol |
|---|---|---|
| **Island** (seperti sebelumnya) | default | drag memutar pulau, snap ke stasiun |
| **Explore** (POV, setinggi mata 1,6) | tombol **Explore** di dock, *scroll* ke dalam, atau klik di tempat | drag untuk melihat sekeliling; klik cincin bercahaya untuk berjalan ke viewpoint; **klik rumput untuk berjalan bebas**; ‹ › berpindah viewpoint; *scroll* keluar / Esc / tombol **Island** untuk kembali |
| **Tour** 360° | tombol ⟲ kanan atas, atau otomatis setelah 50 dtk tanpa input | kamera mengelilingi pulau sambil naik-turun dan maju-mundur; klik, *scroll*, atau tombol apa pun menghentikannya |

- Ada 8 viewpoint: 6 stasiun, *Waterfall* (melayang di samping air terjun), dan *Meadow*. Posisinya **dicari otomatis** (`config/viewpoint-search.ts`): di dalam tepi pulau, tidak di air, jauh dari pohon dan bangunan, dan tidak ada penghalang di garis pandang. Ini memperbaiki viewpoint yang sempat menabrak kanopi pohon.
- Perjalanan kamera mengikuti kurva Catmull-Rom yang memutari kastel, dan untuk vault turun lewat tepi pulau. FOV melebar dari 45° ke 62° saat POV.
- Gerak kamera: *ease in-out*, napas pelan, sedikit getaran *handheld*, dan sway mengikuti mouse. Di mode island ada drift halus supaya bidikan tidak pernah beku.

### 2. Dunia

- **Rumput shader**: ±25 rb rumpun dalam 1 draw call. Rumput bergoyang ditiup embusan angin, menerima **bayangan matahari yang sebenarnya** (shadow map) dan AO yang di-bake, serta punya warna variasi dan bagian kering. Tidak tumbuh di jalan setapak, air, area stasiun, dan pantai.
- **Jejak/pijakan**: *trail map* (render target ping-pong 256²) mencatat tekanan dan arah dari kursor dan langkah pengunjung. Rumput rebah menjauh dari jejak lalu pulih pelan-pelan. Di bawah kursor ada tanda pijakan di tanah di semua mode. Saat mode explore, lingkarannya menyala bila titik itu bisa dituju.
- **Pohon, semak, bunga** bergoyang dengan embusan yang sama (vertex shader dipatch lewat `onBeforeCompile` dan dihitung di ruang dunia, jadi aman untuk mesh terkuantisasi). Pohon KayKit mendapat salinan material sendiri, supaya kastel yang memakai atlas yang sama tidak ikut bergoyang.
- **Air**: kolam, sungai, dan **air terjun** yang jatuh dari tepi pulau ke lautan awan, dengan percikan. Klik air untuk memunculkan riak.
- **Langit**: matahari/bulan dengan glow, bintang di malam hari, **lautan awan** fbm yang berlubang dan memudar ke cakrawala, serta **pulau-pulau jauh** yang mengapung pelan.
- **Kehidupan**: bunga, kunang-kunang (malam) atau serbuk sari (siang), burung yang mengitari pulau, kupu-kupu (siang, berlindung saat hujan), dan api unggun berkedip di Travel Journal.
- **Kristal tersembunyi** (7 buah): klik kristal, atau dekati saat explore, untuk mengambilnya. Penghitung ada di kanan atas, progres disimpan di `localStorage`, dan setiap temuan memunculkan notifikasi. Bila semua ditemukan, label Hidden Vault muncul.

### 3. Cuaca

Ada tiga cuaca: **cerah, hujan, kabut**. Cuaca berganti sendiri tiap 55–95 detik, atau bisa dipilih lewat tombol (pilihan manual mematikan pergantian otomatis). Transisinya halus (±6 dtk) lewat `weatherMix` dan memengaruhi:
- kabut;
- langit (abu-abu, matahari meredup);
- cahaya matahari dan langit;
- kekuatan angin rumput dan pohon;
- hujan (garis tetes yang mengikuti kamera);
- **tetes di lensa** yang membiaskan gambar;
- satwa (bersembunyi saat hujan);
- suara.

### 4. Suara

Musik fantasi dan suara alam dibuat **prosedural dengan Web Audio**, tanpa file dan tanpa urusan lisensi:
- pad akor D lidian (Dmaj9–Bm9–Gmaj7#11–Asus), suara harpa/celesta yang jarang-jarang, dan reverb;
- angin, hujan, burung (siang), dan jangkrik (malam);
- denting saat kristal ditemukan.

Suara mati secara default (kebijakan autoplay browser) dan dinyalakan lewat tombol 🔇/♪.

### 5. Rendering

| Aspek | Implementasi |
|---|---|
| IBL | `Environment` drei dari Lightformer (kubah langit, piringan matahari hangat, rim dingin, pantulan rumput). 1 frame, tanpa unduhan HDR. Dibangun ulang saat siang/malam berganti. |
| Key / rim / fill | Matahari (bayangan lembut) + directional rim dari sisi berlawanan + hemisphere fill. Ketiganya meredup mengikuti cuaca. |
| Baked lighting | AO di-bake per vertex terrain dan per rumpun rumput dari footprint kastel, pohon, dan props (`bakedOcclusion`). |
| PBR | Material kit: metalness 0, roughness ≥ 0,72, envMapIntensity 1. Terrain roughness 0,95. |
| Ketidaksempurnaan | Bercak warna (value noise 2 oktaf) di tanah, strata dan lumut di tebing, batuan bawah yang kasar (displacement noise), rumput dengan tinggi, warna, dan kemiringan acak. |
| Color management | Output sRGB, tekstur dan warna linear, `flat` (tanpa tone mapping di renderer) karena tone mapping dilakukan di post. |
| Post-processing | N8AO (high) → bloom HDR (hanya > 1,05: matahari, api, kristal) → **Khronos PBR Neutral** → vignette → grain → saturasi. MSAA 4× (high) / SMAA (low). Kualitas turun otomatis lewat `PerformanceMonitor`. `?post=off\|low\|high` untuk memaksa satu tingkat. |

**Bug yang ditemukan dan dicatat di kode:** BrightnessContrast dan HueSaturation bisa menghasilkan warna sedikit negatif, lalu grain *soft light* mengubahnya menjadi NaN sehingga muncul bercak hitam. BrightnessContrast dihapus, dan saturasi dipindah ke urutan terakhir. Penyebabnya dicari dengan bisect per efek: 13–15 rb piksel hitam → 0.

## Bukti

- `bukti/19-jelajah-siang.jpg`: POV di Quest Board (siang)
- `bukti/19-air-terjun.jpg`: viewpoint Waterfall
- `bukti/19-pulau-hujan-pijakan.jpg`: island view saat hujan dengan tanda pijakan kursor
- `bukti/19-pulau-malam.jpg`: island view malam
- `bukti/19-jelajah-malam-hujan.jpg`: POV malam + hujan + kunang-kunang + kristal

## Angka (SwiftShader, tanpa GPU, jadi fps bukan acuan)

| Kondisi (`?post=off&debug=stats`, 1280×760, dpr 1) | Draw call | Segitiga |
|---|---:|---:|
| Island view | 112 | 340 rb |
| Explore (Quest Board) | 107 | 382 rb |

- Sebelumnya: 72 draw call / 75 rb segitiga. Tambahan terbesar berasal dari rumput (±25 rb rumpun × 15 segitiga), dan semuanya masuk dalam 1 draw call.
- Perlindungan untuk perangkat lemah:
  - layar sempit: rumput 50%, post *low*, shadow map 1024, tetes hujan lebih sedikit;
  - bila frame tetap lambat: dpr 1, bayangan mati, post *low*, rumput 35%.
- Aset 3D tidak bertambah (tetap 0,70 MB). Semua efek baru prosedural.
- Dependensi baru: `@react-three/postprocessing` ^3.1.3 dan `postprocessing` ^6.39.5 (peer: three < 0.187).

## Hasil cek

- `yarn type-check` hijau, `yarn lint` 0 masalah, `yarn build` hijau.
- Console bersih: tidak ada error shader. Peringatan yang tersisa (`THREE.Clock` deprecated dari R3F, `PCFSoftShadowMap` → PCF di three 0.186) sudah ada sebelumnya.

## Checklist manual (melengkapi `14-rilis.md`)

- [ ] Laptop: fps di island dan explore dengan `?debug=stats`. Bila < 50, coba `?post=low`.
- [ ] HP: masuk explore, drag untuk melihat, ketuk rumput untuk berjalan, dan pastikan halaman tidak ikut menggulir.
- [ ] Nyalakan suara, lalu ganti cuaca (hujan → suara hujan) dan tema (malam → jangkrik).
- [ ] Gerakkan kursor di rumput: jejak harus terlihat lalu pulih. Pohon harus bergoyang.
- [ ] Kumpulkan 7 kristal, lalu label Hidden Vault muncul.
- [ ] Tur: diamkan 50 dtk, lalu klik untuk berhenti.

## Pertanyaan terbuka

1. Musik prosedural cukup, atau ingin trek rekaman (CC0/berlisensi) sebagai gantinya?
2. Posisi tiap kristal bisa diubah di `src/modules/world/config/crystals.ts`. Apakah kristal perlu memberi hadiah selain membuka label vault?
3. Tur otomatis setelah 50 detik: pertahankan, perlama, atau matikan?
4. Belum diterapkan dari referensi (berat atau berisiko di HP): TAA, *god rays*, awan volumetrik raymarching, dan aurora. Bisa dikerjakan berikutnya bila diinginkan.

## Self-review

1. Semua permintaan pemilik sudah tercakup: POV + tetap bisa diputar, cuaca, tur 360°, musik, objek bergerak, pohon bergoyang, pijakan kursor, dan tujuh aspek rendering.
2. Tidak ada kode atau aset dari situs referensi. Semua shader, audio, dan geometri ditulis di repo ini.
3. Warna dari token `--color-world-*` (token baru: path, water, foam, cloud, blossom, pollen, firefly, fire, marker), teks UI dari `content/world.ts`, tidak ada `any` baru. Mutasi uniform lewat helper (`setUniforms`), sesuai aturan React Compiler.
4. Tetap aman: `/` dan `/2d/*` tidak memuat three. Fallback tanpa WebGL tidak berubah. Efek gerak mengikuti `prefers-reduced-motion` dan tombol efek.
