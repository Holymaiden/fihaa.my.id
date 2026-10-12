# Fase 6 — Pencarian & Kurasi Aset

Branch: `claude/clever-albattani-e7tn9x` (PR Holymaiden/fihaa.my.id#216), sesuai keputusan di `09-keputusan-dunia.md`.
Status: **menunggu akses jaringan ke Quaternius, lalu persetujuan daftar aset**. Fase 7 belum dimulai.

## Ringkasan

- **Usulan paket utama: KayKit** (Kay Lousberg, CC0), yaitu *Medieval Hexagon Pack* + *Dungeon Remastered*, dengan pelengkap *Halloween Bits* (lentera, gerbang, nuansa misterius) dan 6 aksesori dari *Character Pack Adventures* (spellbook, mug, tongkat sihir, perisai).
- 88 model kandidat sudah diunduh dari GitHub resmi KayKit ke `assets/raw/kaykit/` bersama `LICENSE.txt` dan `SOURCE.md` (URL + commit) per paket. Daftar lengkap ada di `ASSETS.md`.
- Ukuran mentah 88 model: **3,48 MB** (gltf/bin/glb) · **52.870 segitiga**. Isi folder `assets/raw` termasuk tekstur dan lisensi: 3.656.844 byte. Anggarannya ≤ 10 MB *setelah* kompresi, dan angka ini sudah di bawah anggaran sebelum kompresi.
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
| Bangunan guild | Pusat/landmark | **`building_castle_blue`** (keputusan pemilik), pendukung `building_barracks_blue`, `building_tower_A_blue`, `banner_*`, `shield_badge_color`. Gereja DITOLAK. | — |
| Papan quest | Proyek | Bahan rakitan: `post`, `pallet`, `resource_lumber`, `plaque` | Tidak ada model papan quest jadi |
| Skill tree | Skill | — | Tidak ada pohon besar yang cocok |
| Jurnal perjalanan | Pengalaman | `spellbook_open`, `spellbook_closed`, `table_medium_decorated_A` | — |
| Kedai/kotak surat | Kontak | `building_tavern_blue`, `building_market_blue`, `building_well_blue`, `building_home_A_blue`, `building_windmill_blue`, `mug_full`, `keg`, `barrel_small_stack`, `table_small_decorated_A`, `stool` | Kotak surat tidak ada |
| Ruangan rahasia | Proyek unggulan | `arch`, `arch_gate`, `wall_arched`, `wall_doorway`, `floor_tile_large`, `pillar_decorated`, `torch_lit`, `torch_mounted`, `candle_*`, `shrine_candles`, `staff`, `wand`, `plaque_candles`, `shelf_small_candles`, `chest_gold`, `coin_stack_medium`, `key`, `sword_shield_gold`, `tree_dead_medium` | Kristal tidak ada |
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
5. **Pratinjau**: 85 model dirender dengan three 0.186 (dari `node_modules`) dan GLTFLoader di Chromium headless dengan pencahayaan seragam → `bukti/10-pratinjau-aset.jpg` (render awal, masih memuat gereja dan buku yang kini dihapus). Tidak ada error pemuatan.
6. **Raw aset tidak ikut dikirim ke browser**: `assets/raw/` berada di luar `public/` dan tidak diimpor kode mana pun. Konversi dan kompresi baru dilakukan di Fase 8.

## Hasil cek

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau (route sama seperti sebelumnya).
- Isolasi three (uji runtime `next start` + Playwright, chunk three `0re5syxhnt3x7.js`): `/`, `/2d`, `/2d/about`, `/2d/projects`, `/2d/contact` → tidak memuat chunk three; `/world` → memuat. Fase ini tidak mengubah kode aplikasi.

## Pencarian lanjutan (setelah jawaban pemilik)

| Sumber yang diperiksa | Hasil |
|---|---|
| 10 repo resmi KayKit di GitHub (`git ls-tree`, nama model) | Adventures: `spellbook_open/closed`, `mug_full`, `staff`, `wand`, `shield_badge_color` cocok dan **ditambahkan**. City Builder, Prototype, Space Base, Restaurant, dan Furniture tidak cocok (modern/prototipe/luar angkasa). Tidak ada papan quest, kotak surat, kristal, atau pohon besar. |
| Repo resmi Kenney (`github.com/KenneyNL`, 5 Starter Kit) | Dirender berdampingan dengan KayKit (`bukti/10-pratinjau-tambahan.jpg`). Platform berwarna kuning-hitam bergaya game platformer, Mini Arena bernuansa salem pastel; keduanya **tidak menyatu** dengan KayKit, jadi tidak dipakai. |
| Pencarian web (Quaternius, KayKit itch.io) | Quaternius *Medieval Village Pack* versi lama (flat color, CC0) tersedia per model di Poly Pizza, jadi kandidat Quaternius terbaik. Permata KayKit hanya ada di *Resource Bits EXTRA* (berbayar). Daftar isi MegaKit Quaternius tidak bisa dipastikan tanpa mengunduh. |
| Perubahan | `building_church_*` dihapus (keputusan pemilik). Buku Furniture Bits diganti spellbook. |

Celah yang masih tersisa: papan quest, skill tree, kotak surat, kristal, dan sisi bawah pulau. Ini dicek ulang di paket Quaternius setelah akses terbuka. Kalau tetap tidak ada, dibuat dari geometri flat-color sederhana atau dirakit dari bagian KayKit.

## Akses jaringan

Saya **tidak bisa** mengubah allowlist sendiri; itu pengaturan environment yang hanya bisa diubah pemilik. Setelah pemilik memperbarui whitelist, uji ulang dari sesi ini tetap **ditolak (HTTP 403 dari proxy)** untuk `quaternius.com`, `www.quaternius.com`, `quaternius.itch.io`, `itch.io`, `opengameart.org`, `poly.pizza`, `static.poly.pizza`, `api.poly.pizza`, `drive.google.com`, `kaylousberg.itch.io`, dan `kenney.nl`. Kemungkinan penyebabnya: (a) kebijakan jaringan hanya berlaku untuk sesi/container baru, atau (b) nama domain di whitelist berbeda dengan yang dicoba.

Langkah (dokumentasi: https://code.claude.com/docs/en/cloud-environments#network-access):
1. Buka menu environment cloud di bilah judul sesi → **Edit**.
2. Di **Network access**, pilih level **Limited** (atau **Custom** di aplikasi versi lama). Biarkan kotak *Allow package managers* / *include default list* tetap dicentang.
3. Tambahkan di **Allowed domains**, satu per baris:
   - `opengameart.org` (zip langsung Quaternius & Kenney, tanpa login)
   - `poly.pizza`, `static.poly.pizza`, `api.poly.pizza` (GLB per model Quaternius)
   - `quaternius.com`, `www.quaternius.com`
   - opsional: `kenney.nl`, `itch.io`, `quaternius.itch.io`, `kaylousberg.itch.io`, `img.itch.zone`. Unduhan itch.io tetap butuh klik "Download" sehingga mungkin tetap harus manual.
4. Simpan, lalu **mulai sesi baru** di environment yang sama (atau kirim pesan di sini; saya uji ulang dengan `curl`). Jika masih 403, kirimkan daftar domain persis seperti yang tertulis di pengaturan.

## Pertanyaan Terbuka

1. Akses jaringan ke Quaternius (lihat atas). Setelah terbuka: unduh *Medieval Village Pack* (Poly Pizza/OpenGameArt) dan MegaKit Standard (OpenGameArt), render bersama KayKit, lalu putuskan paket utama.
2. Persetujuan akhir daftar aset menunggu hasil butir 1.

## Self-review Fase 6

1. Langkah 1–8 tercakup. Langkah 5 hanya terlaksana untuk KayKit karena sumber lain diblokir sandbox; sisanya dicatat di "Perlu Diunduh Manual".
2. Klaim ukuran, segitiga, lisensi, dan commit diukur atau dibaca dari berkas. Klaim tentang Quaternius/Kenney/Forest Pack berasal dari cuplikan hasil pencarian dan ditandai demikian.
3. `git status`: hanya `ASSETS.md`, `assets/raw/`, `docs/migrasi/09-*.md`, `10-aset.md`, `bukti/10-pratinjau-aset.jpg`, dan ringkasan. Tidak ada perubahan kode.
4. Ke-88 model punya baris di `ASSETS.md` (dihitung: 88 baris = 88 berkas model); setiap folder paket berisi `LICENSE.txt`.
5. Tidak ada kode baru, jadi tidak ada konten, gaya, atau `any` yang di-hardcode.
6. type-check, lint, build hijau.
7. `/` dan `/2d/*` bebas chunk three (uji runtime).
8. Navigasi tidak berubah di fase ini (belum ada kode dunia).
Diperbarui setelah jawaban pemilik: gereja dihapus, buku diganti spellbook, 6 aksesori Adventures ditambah (88 baris = 88 berkas model). Diperbaiki saat review: inventaris awal melewatkan 21 model Dungeon (berformat `.glb`, bukan `.gltf`); skrip diperbaiki dan total dihitung ulang (2,32 → 3,50 MB).
