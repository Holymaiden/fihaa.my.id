# Fase 6 — Pencarian & Kurasi Aset

Branch: `claude/clever-albattani-e7tn9x` (PR Holymaiden/fihaa.my.id#216), sesuai keputusan di `09-keputusan-dunia.md`.
Status: **selesai, menunggu persetujuan daftar aset**. Fase 7 belum dimulai.

## Ringkasan

- **Usulan paket utama: KayKit** (Kay Lousberg, CC0), yaitu *Medieval Hexagon Pack* + *Dungeon Remastered*, dengan pelengkap *Halloween Bits* (lentera, gerbang, nuansa misterius) dan 2 model buku dari *Furniture Bits*.
- 85 model kandidat sudah diunduh dari GitHub resmi KayKit ke `assets/raw/kaykit/` bersama `LICENSE.txt` dan `SOURCE.md` (URL + commit) per paket. Daftar lengkap ada di `ASSETS.md`.
- Ukuran mentah 85 model: **3,50 MB** (gltf/bin/glb) · **52.873 segitiga**. Isi folder `assets/raw` termasuk tekstur dan lisensi: 3.642.425 byte. Anggarannya ≤ 10 MB *setelah* kompresi, dan angka ini sudah di bawah anggaran sebelum kompresi.
- Quaternius **tidak** saya usulkan sebagai paket utama, meskipun urutan prioritasnya di depan. Alasannya ada di bawah; keputusan akhirnya di tangan Anda.

## Mengapa KayKit, bukan Quaternius

| Kriteria | KayKit (4 paket di atas) | Quaternius MegaKit (Medieval Village / Stylized Nature / Fantasy Props) |
|---|---|---|
| Kecocokan dengan keputusan no. 1 "flat color" | Semua model memakai **satu atlas gradien kecil** (PNG 16–24 KB, 7 salinan identik di hex pack, md5 `148606bb…`). Hasil render: warna rata per bidang (`bukti/10-pratinjau-aset.jpg`). | Halaman Quaternius menyebut MegaKit **"Textured"**; Fantasy Props memakai "4 texture sets" (dari cuplikan hasil pencarian, situsnya tidak bisa saya buka). Lebih ke gaya stylized bertekstur. |
| Konsistensi gaya | Satu seniman, satu atlas dan proporsi yang sama di keempat paket (terlihat di pratinjau). | Konsisten di dalam satu kit, tetapi pack Quaternius yang lebih lama dan flat (Ultimate Nature) berbeda era dan tanpa glTF. |
| Cakupan kebutuhan | Terrain hex (termasuk `hex_grass_bottom` untuk pulau), kedai/tavern, pasar, sumur, kastel/menara (guild), jembatan, gerbang, pohon, batu, awan, peti, obor, lilin, lentera, buku. | Bangunan + alam + prop lengkap, tetapi isi tier gratis (Standard) tidak bisa saya periksa. |
| Bisa diverifikasi di sandbox | Ya. Di-clone dari `github.com/KayKit-Game-Assets`, lisensi dibaca dari berkas, ukuran dan segitiga diukur, model dirender. | Tidak. `quaternius.com`, `*.itch.io`, `opengameart.org` diblokir sandbox (lihat Proses). |

Kalau Anda tetap ingin Quaternius sebagai utama, paketnya ada di bagian "Perlu Diunduh Manual" di `ASSETS.md`, lengkap dengan folder tujuan. Kurasi perlu diulang setelah berkasnya ada.

## Kebutuhan per kelompok → kandidat

| Kelompok | Stasiun/peran | Kandidat (detail di `ASSETS.md`) | Celah |
|---|---|---|---|
| Terrain/pulau | Semua | `hex_grass`, `hex_grass_bottom`, `hex_grass_sloped_*`, `hex_road_A/B/E`, `hex_coast_A_waterless`, `hex_water`, `hills_A`, `hill_single_A`, `mountain_A_grass_trees` | Sisi bawah pulau melayang (kerucut batu) belum ada |
| Bangunan guild | Pusat/landmark | `building_castle_blue`, `building_barracks_blue`, `building_church_blue`, `building_tower_A_blue`, `banner_*` | Pilih satu (pertanyaan 4) |
| Papan quest | Proyek | Bahan rakitan: `post`, `pallet`, `resource_lumber`, `plaque` | Tidak ada model papan quest jadi |
| Skill tree | Skill | — | Tidak ada pohon besar yang cocok |
| Jurnal perjalanan | Pengalaman | `book_set`, `book_single`, `table_medium_decorated_A` | — |
| Kedai/kotak surat | Kontak | `building_tavern_blue`, `building_market_blue`, `building_well_blue`, `building_home_A_blue`, `building_windmill_blue`, `keg`, `barrel_small_stack`, `table_small_decorated_A`, `stool` | Kotak surat tidak ada |
| Ruangan rahasia | Proyek unggulan | `arch`, `arch_gate`, `wall_arched`, `wall_doorway`, `floor_tile_large`, `pillar_decorated`, `torch_lit`, `torch_mounted`, `candle_*`, `shrine_candles`, `plaque_candles`, `shelf_small_candles`, `chest_gold`, `coin_stack_medium`, `key`, `sword_shield_gold`, `tree_dead_medium` | Kristal tidak ada |
| Pohon/batu/kristal | Dekorasi (instancing di Fase 8) | `tree_single_A/B`, `trees_A_*`, `trees_B_*`, `rock_single_A–E` | Kristal tidak ada |
| Jembatan/gerbang | Penghubung pulau | `building_bridge_A/B`, `fence_wood_straight(_gate)`, `wall_straight_gate`, `arch_gate` | — |
| Prop kecil | Dekorasi | `lantern_standing`, `lantern_hanging`, `post_lantern`, `chest`, `barrel`, `crate_A_big`, `crate_open`, `sack`, `bucket_water`, `flag_blue`, `weaponrack`, `target`, `tent` | Kotak surat (lihat Kontak) |
| Langit/awan | Latar | `cloud_big`, `cloud_small`; langit = gradien prosedural | — |
| Karakter | — | Tidak dipilih di tahap ini (`09-keputusan-dunia.md`). Kandidat masa depan: KayKit Character Pack Adventures (GitHub, CC0). | — |

Catatan dari pratinjau: `building_bridge_A` dan `_B` tampak sama dan berukuran sama (28.615 byte), tetapi berkas `.bin`-nya berbeda (`cmp`: beda di byte 4), jadi kemungkinan varian orientasi. `tent` tampak seperti meja kain. `chest_gold` tampak sama dengan `chest` saat tertutup (isinya baru terlihat bila tutup dibuka). Kandidat yang ternyata tidak berguna akan dibuang di Fase 8.

## Proses dan bukti

1. **Jaringan**: `curl` ke `quaternius.com`, `kaylousberg.itch.io`, `kenney.nl`, `poly.pizza`, `polyhaven.com`, `api.polyhaven.com`, `ambientcg.com`, `opengameart.org`, dan `drive.google.com` → `connect_rejected` oleh proxy (kebijakan organisasi). WebFetch ke `quaternius.com` dan `quaternius.itch.io` → `ENOTFOUND`. Hanya GitHub yang bisa dijangkau. Informasi paket non-GitHub berasal dari cuplikan hasil pencarian web dan ditandai demikian di `ASSETS.md`.
2. **Unduhan**: `git clone --depth 1 --filter=blob:none --sparse` dari repo resmi KayKit, hanya folder `gltf/`, tekstur, dan lisensi. Commit: Medieval Hexagon `84fa4e91`, Dungeon Remastered `b0ca9bd9`, Halloween Bits `6dc69bf6`, Furniture Bits `96d5930a`, Restaurant Bits `153c8a75` (diperiksa, tidak disalin).
3. **Lisensi**: keempat `LICENSE.txt` berbunyi "License: (Creative Commons Zero, CC0) … free to use in personal, educational and commercial projects … crediting … (this is not mandatory)". Berkas disalin apa adanya ke tiap folder paket.
4. **Ukuran dan segitiga**: skrip membaca JSON glTF/GLB; ukuran = `.gltf` + `.bin` (atau `.glb`), segitiga = `count` accessor indeks / 3. Per paket: hex 52 model 2.165.873 B · dungeon 21 model 1.181.626 B · halloween 10 model 256.506 B · furniture 2 model 38.420 B (termasuk tekstur dan lisensi). Model terbesar: `building_castle_blue` 320,8 KB / 5.659 segitiga.
5. **Pratinjau**: 85 model dirender dengan three 0.186 (dari `node_modules`) dan GLTFLoader di Chromium headless dengan pencahayaan seragam → `bukti/10-pratinjau-aset.jpg`. Tidak ada error pemuatan.
6. **Raw aset tidak ikut dikirim ke browser**: `assets/raw/` berada di luar `public/` dan tidak diimpor kode mana pun. Konversi dan kompresi baru dilakukan di Fase 8.

## Hasil cek

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau (route sama seperti sebelumnya).
- Isolasi three (uji runtime `next start` + Playwright, chunk three `0re5syxhnt3x7.js`): `/`, `/2d`, `/2d/about`, `/2d/projects`, `/2d/contact` → tidak memuat chunk three; `/world` → memuat. Fase ini tidak mengubah kode aplikasi.

## Pertanyaan Terbuka

1. **Persetujuan paket utama**: KayKit (usulan) atau Quaternius? Dan apakah 85 kandidat di `ASSETS.md` disetujui, atau ada yang dicoret/ditambah?
2. **Palet (keputusan no. 2)** masih kosong. Ini menentukan varian warna bangunan KayKit (`blue/red/green/yellow`; sementara `blue`) dan semua warna Fase 9.
3. **Celah tanpa aset**: papan quest, skill tree, kotak surat, kristal, dan sisi bawah pulau. Usulan: geometri flat-color sederhana buatan sendiri (tanpa lisensi pihak ketiga, ukuran ~0 KB) atau rakitan dari bagian KayKit. Setuju?
4. **Bangunan guild**: di daftar stasiun tidak ada stasiun "guild". Apakah guild hanya landmark/pusat dunia? Jika ya, pakai `castle`, `barracks`, atau `church`?
5. **Ruangan rahasia = proyek unggulan**: `is_featured` bernilai `true` di 17 dari 25 proyek, sehingga isinya akan hampir sama dengan Papan Quest. Perlu kriteria lain (mis. field baru `is_secret`, atau daftar 3–5 slug pilihan Anda)? Ini memengaruhi Fase 7, bukan Fase 6.
6. **KayKit Forest Nature Pack** (100+ pohon/semak/batu bergaya sama, CC0, itch.io): perlu diunduh manual oleh Anda, atau cukup pohon dari hex pack?
7. **Aset mentah di repo**: 3,6 MB berkas biner di `assets/raw/` ikut di-commit agar asal-usulnya terlacak. Boleh, atau Anda lebih suka di luar repo (mis. hanya hasil kompresi di `public/`)?
8. **Akses jaringan**: jika Anda ingin saya mengunduh dari Quaternius/itch.io/Kenney sendiri, domain-domain tersebut perlu ditambahkan ke *Allowed domains* di pengaturan Network access environment ini (https://code.claude.com/docs/en/cloud-environments#network-access).

## Self-review Fase 6

1. Langkah 1–8 tercakup. Langkah 5 hanya terlaksana untuk KayKit karena sumber lain diblokir sandbox; sisanya dicatat di "Perlu Diunduh Manual".
2. Klaim ukuran, segitiga, lisensi, dan commit diukur atau dibaca dari berkas. Klaim tentang Quaternius/Kenney/Forest Pack berasal dari cuplikan hasil pencarian dan ditandai demikian.
3. `git status`: hanya `ASSETS.md`, `assets/raw/`, `docs/migrasi/09-*.md`, `10-aset.md`, `bukti/10-pratinjau-aset.jpg`, dan ringkasan. Tidak ada perubahan kode.
4. Ke-85 model punya baris di `ASSETS.md` (dihitung: 85 baris = 85 berkas model); setiap folder paket berisi `LICENSE.txt`.
5. Tidak ada kode baru, jadi tidak ada konten, gaya, atau `any` yang di-hardcode.
6. type-check, lint, build hijau.
7. `/` dan `/2d/*` bebas chunk three (uji runtime).
8. Navigasi tidak berubah di fase ini (belum ada kode dunia).
Diperbaiki saat review: inventaris awal melewatkan 21 model Dungeon (berformat `.glb`, bukan `.gltf`); skrip diperbaiki dan total dihitung ulang (2,32 → 3,50 MB).
