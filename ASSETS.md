# Aset 3D — Daftar Kandidat dan Lisensi

Status: **DISETUJUI pemilik 2026-10-12** (Fase 6): KayKit (utama, 88 model) + Quaternius Ultimate Nature (pelengkap alam, 13 model). Belum ada aset yang dipakai di kode.
Keputusan acuan: `docs/migrasi/09-keputusan-dunia.md` (gaya *low-poly flat color*, kamera terbang, anggaran ≤ 10 MB setelah kompresi).
Laporan dan alasan pemilihan: `docs/migrasi/10-aset.md`. Pratinjau render: `docs/migrasi/bukti/10-pratinjau-aset.jpg` (KayKit), `10-pratinjau-quaternius.jpg` (KayKit vs 4 paket Quaternius), `10-pratinjau-campuran.jpg` (KayKit + Ultimate Nature dalam satu adegan).

Aturan file ini:
- Setiap aset yang masuk ke `public/` atau dimuat di `/world` **wajib** punya baris di sini.
- Kolom "Atribusi" menyatakan kewajiban lisensi. CC0 tidak mewajibkan atribusi, tetapi semua sumber tetap dicantumkan di halaman kredit (Fase 8).
- Lisensi tidak jelas, CC-BY-NC, atau melarang penggunaan di web → **DITOLAK**.

## Ringkasan paket

| Peran | Paket | Sumber | Lisensi | Atribusi | Format | Status |
|---|---|---|---|---|---|---|
| **Utama** | KayKit Medieval Hexagon Pack 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0 · https://kaylousberg.itch.io/kaykit-medieval-hexagon | CC0 1.0 (`LICENSE.txt` di repo) | Tidak wajib; penulis meminta kredit sukarela "Kay Lousberg, www.kaylousberg.com" | glTF (+ FBX, OBJ) | Subset diunduh → `assets/raw/kaykit/medieval-hexagon/` |
| **Utama** | KayKit Dungeon Remastered 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0 | CC0 1.0 | Tidak wajib (sama seperti di atas) | GLB (+ FBX, OBJ) | Subset diunduh → `assets/raw/kaykit/dungeon-remastered/` |
| Pelengkap | KayKit Halloween Bits 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0 | CC0 1.0 | Tidak wajib | glTF (+ FBX, OBJ) | Subset diunduh → `assets/raw/kaykit/halloween-bits/` |
| Pelengkap | KayKit Character Pack: Adventures 1.0 (aksesori saja) | https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | CC0 1.0 (`LICENSE.txt` di repo) | Tidak wajib | glTF (+ FBX) | 6 aksesori diunduh → `assets/raw/kaykit/character-pack-adventures/`. Karakternya sendiri tidak dipakai di tahap ini. |
| **Pelengkap alam** | Quaternius Ultimate Nature Pack (150 model, *flat color*) | https://quaternius.com/packs/ultimatenature.html · https://quaternius.itch.io/150-lowpoly-nature-models | CC0 1.0 (`License.txt` di zip) | Tidak wajib; penulis meminta dukungan sukarela "@Quaternius" | OBJ + MTL, FBX, Blend (**tanpa glTF**, dikonversi di Fase 8) | 13 model diunduh → `assets/raw/quaternius/ultimate-nature/`. Mengisi celah pohon besar (Skill Tree) dan variasi alam. |
| Tidak diperlukan | KayKit Forest Nature Pack (tier gratis) | https://kaylousberg.itch.io/kaykit-forest | CC0 (menurut halaman itch.io) | Tidak wajib | FBX, GLTF, OBJ | Celah pohon besar sudah terisi Ultimate Nature, jadi paket ini tidak perlu diunduh. |
| Tidak terjangkau | Quaternius Medieval Village Pack (versi lama, *flat color*, 44 model) | https://quaternius.com/packs/medievalvillage.html (tombol unduh → Google Drive) · https://poly.pizza/bundle/Medieval-Village-Pack-NsHhjhlrfY · https://opengameart.org/content/lowpoly-medieval-village-pack | CC0 (halaman quaternius.com) | Tidak wajib | FBX, OBJ, Blend | Tidak ada di itch.io. Ketiga jalur unduhan gagal dari sandbox (2026-10-12): `drive.google.com` ditolak proxy, `poly.pizza`/`static.poly.pizza` HTTP 403, `opengameart.org` HTTP 500. Lihat "Perlu Diunduh Manual". |
| Tidak dipilih (gaya) | Quaternius Medieval Village MegaKit (Standard) | https://quaternius.com/packs/medievalvillagemegakit.html · https://quaternius.itch.io/medieval-village-megakit | CC0 1.0 (`License_Standard.txt` di zip) | Tidak wajib | glTF + FBX + OBJ; 27 tekstur PNG (73 MB) | Diunduh dan dirender (2026-10-12). **Bertekstur PBR** (plester, bata, kayu bergurat), tidak menyatu dengan KayKit flat color (`bukti/10-pratinjau-quaternius.jpg` baris 2). Tidak disimpan di repo. |
| Tidak dipilih (gaya) | Quaternius Stylized Nature MegaKit (Standard) | https://quaternius.com/packs/stylizednaturemegakit.html · https://quaternius.itch.io/stylized-nature-megakit | CC0 1.0 (`License_Standard.txt` di zip) | Tidak wajib | glTF + FBX + OBJ; 20 tekstur PNG (38 MB) | Diunduh dan dirender. Daun berupa kartu tekstur alfa (gaya Ghibli), tidak flat (baris 3). Tidak disimpan. |
| Tidak dipilih (gaya) | Quaternius Fantasy Props MegaKit (Standard) | https://quaternius.com/packs/fantasypropsmegakit.html · https://quaternius.itch.io/fantasy-props-megakit | CC0 1.0 (`License_Standard.txt` di zip) | Tidak wajib | glTF + FBX + OBJ; 4 set tekstur trim (37 MB) | Diunduh dan dirender. Tekstur realistis dengan normal map (baris 4). Tidak disimpan. |
| Cadangan | Kenney Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit · https://opengameart.org/content/fantasy-town-kit | CC0 | Tidak wajib ("Kenney.nl", opsional) | FBX, OBJ, glTF | Perlu diunduh manual |
| Cadangan | Kenney Nature Kit | https://kenney.nl/assets/nature-kit · https://opengameart.org/content/nature-kit | CC0 | Tidak wajib | FBX, OBJ (glTF belum dipastikan) | Perlu diunduh manual |
| Tidak diperlukan | Poly Haven HDRI langit | https://polyhaven.com/hdris | CC0 | Tidak wajib | HDR/EXR | Tidak dipakai: foto realistis bertentangan dengan gaya flat color. Langit dibuat gradien prosedural (0 KB). |
| Tidak diperlukan | ambientCG tekstur PBR | https://ambientcg.com | CC0 | Tidak wajib | PNG/JPG | Tidak dipakai: gaya flat color tidak memakai tekstur PBR. |
| Tidak dipilih | KayKit Furniture Bits 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Furniture-Bits-1.0 | CC0 1.0 | Tidak wajib | glTF | Sempat diunduh (2 buku), diganti `spellbook_*` dari Adventures yang lebih cocok dengan tema; sisanya perabot modern. |
| Tidak dipilih | KayKit City Builder Bits, Prototype Bits, Space Base Bits | https://github.com/KayKit-Game-Assets | CC0 | Tidak wajib | glTF | Diperiksa (daftar model): kota modern, prototipe, dan luar angkasa; tidak cocok dengan tema guild. |
| Tidak dipilih | Kenney Starter Kit 3D Platformer / Basic Scene (Mini Arena) | https://github.com/KenneyNL/Starter-Kit-3D-Platformer · https://github.com/KenneyNL/Starter-Kit-Basic-Scene | Platformer: MIT (repo) · Mini Arena: CC0 | MIT: wajib menyertakan pemberitahuan hak cipta | GLB | Dirender dan dibandingkan: platform kuning-hitam bergaya game platformer, batu Mini Arena berwarna salem pastel; keduanya tidak menyatu dengan KayKit. |
| Tidak dipilih | KayKit Restaurant Bits 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Restaurant-Bits-1.0 | CC0 1.0 | Tidak wajib | glTF | Diperiksa, tidak diunduh: isinya dapur modern (kulkas, burger, kompor) yang tidak cocok dengan tema guild. |

## Kandidat model (subset yang sudah diunduh)

Semua dari KayKit oleh Kay Lousberg · Lisensi **CC0 1.0** · Atribusi **tidak wajib**. Ukuran adalah ukuran berkas mentah sebelum kompresi; jumlah segitiga dihitung dari accessor indeks glTF. Varian warna bangunan sementara memakai `blue`. Setiap bangunan tersedia dalam `blue/red/green/yellow` dan pilihannya menunggu keputusan palet.

#### Terrain/pulau

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `hex_grass` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 5.3 KB | 36 | `assets/raw/kaykit/medieval-hexagon/tiles/base/hex_grass.gltf` |
| `hex_grass_bottom` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 4.2 KB | 20 | `assets/raw/kaykit/medieval-hexagon/tiles/base/hex_grass_bottom.gltf` |
| `hex_grass_sloped_high` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 5.0 KB | 34 | `assets/raw/kaykit/medieval-hexagon/tiles/base/hex_grass_sloped_high.gltf` |
| `hex_grass_sloped_low` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 4.9 KB | 34 | `assets/raw/kaykit/medieval-hexagon/tiles/base/hex_grass_sloped_low.gltf` |
| `hex_water` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 4.4 KB | 24 | `assets/raw/kaykit/medieval-hexagon/tiles/base/hex_water.gltf` |
| `hex_road_A` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 6.5 KB | 58 | `assets/raw/kaykit/medieval-hexagon/tiles/roads/hex_road_A.gltf` |
| `hex_road_B` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 9.1 KB | 118 | `assets/raw/kaykit/medieval-hexagon/tiles/roads/hex_road_B.gltf` |
| `hex_road_E` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 10.1 KB | 136 | `assets/raw/kaykit/medieval-hexagon/tiles/roads/hex_road_E.gltf` |
| `hex_coast_A_waterless` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 8.3 KB | 102 | `assets/raw/kaykit/medieval-hexagon/tiles/coast/waterless/hex_coast_A_waterless.gltf` |
| `hills_A` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 24.5 KB | 383 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/hills_A.gltf` |
| `hill_single_A` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 6.1 KB | 60 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/hill_single_A.gltf` |
| `mountain_A_grass_trees` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 29.7 KB | 468 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/mountain_A_grass_trees.gltf` |

#### Bangunan guild

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `building_castle_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 313.3 KB | 5.659 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_castle_blue.gltf` |
| `building_tower_A_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 115.1 KB | 2.138 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_tower_A_blue.gltf` |
| `building_barracks_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 227.3 KB | 4.007 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_barracks_blue.gltf` |
| `banner_patternA_blue` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 24.6 KB | 110 | `assets/raw/kaykit/dungeon-remastered/banner_patternA_blue.gltf.glb` |
| `banner_shield_blue` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 53.8 KB | 639 | `assets/raw/kaykit/dungeon-remastered/banner_shield_blue.gltf.glb` |
| `shield_badge_color` | [Character Pack Adventures](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) | gltf + bin + png | 13.3 KB | 262 | `assets/raw/kaykit/character-pack-adventures/shield_badge_color.gltf` |

#### Papan quest (bahan rakitan)

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `resource_lumber` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 14.6 KB | 220 | `assets/raw/kaykit/medieval-hexagon/decoration/props/resource_lumber.gltf` |
| `pallet` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 7.9 KB | 72 | `assets/raw/kaykit/medieval-hexagon/decoration/props/pallet.gltf` |
| `plaque` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 8.4 KB | 88 | `assets/raw/kaykit/halloween-bits/plaque.gltf` |
| `post` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 8.9 KB | 96 | `assets/raw/kaykit/halloween-bits/post.gltf` |

#### Jurnal perjalanan

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `spellbook_open` | [Character Pack Adventures](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) | gltf + bin + png | 17.8 KB | 292 | `assets/raw/kaykit/character-pack-adventures/spellbook_open.gltf` |
| `spellbook_closed` | [Character Pack Adventures](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) | gltf + bin + png | 17.2 KB | 292 | `assets/raw/kaykit/character-pack-adventures/spellbook_closed.gltf` |
| `table_medium_decorated_A` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 80.7 KB | 1.186 | `assets/raw/kaykit/dungeon-remastered/table_medium_decorated_A.gltf.glb` |

#### Kedai

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `building_tavern_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 169.9 KB | 2.992 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_tavern_blue.gltf` |
| `building_market_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 151.6 KB | 3.125 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_market_blue.gltf` |
| `building_well_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 44.4 KB | 726 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_well_blue.gltf` |
| `building_home_A_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 57.1 KB | 1.011 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_home_A_blue.gltf` |
| `building_windmill_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 145.5 KB | 2.653 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_windmill_blue.gltf` |
| `mug_full` | [Character Pack Adventures](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) | gltf + bin + png | 18.4 KB | 426 | `assets/raw/kaykit/character-pack-adventures/mug_full.gltf` |
| `keg` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 58.5 KB | 807 | `assets/raw/kaykit/dungeon-remastered/keg.gltf.glb` |
| `barrel_small_stack` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 95.8 KB | 1.149 | `assets/raw/kaykit/dungeon-remastered/barrel_small_stack.gltf.glb` |
| `table_small_decorated_A` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 66.1 KB | 986 | `assets/raw/kaykit/dungeon-remastered/table_small_decorated_A.gltf.glb` |
| `stool` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 27.9 KB | 172 | `assets/raw/kaykit/dungeon-remastered/stool.gltf.glb` |

#### Ruangan rahasia

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `chest_gold` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 136.9 KB | 1.568 | `assets/raw/kaykit/dungeon-remastered/chest_gold.glb` |
| `torch_lit` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 30.5 KB | 270 | `assets/raw/kaykit/dungeon-remastered/torch_lit.gltf.glb` |
| `torch_mounted` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 32.4 KB | 278 | `assets/raw/kaykit/dungeon-remastered/torch_mounted.gltf.glb` |
| `candle_triple` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 27.6 KB | 198 | `assets/raw/kaykit/dungeon-remastered/candle_triple.gltf.glb` |
| `candle_lit` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 22.1 KB | 120 | `assets/raw/kaykit/dungeon-remastered/candle_lit.gltf.glb` |
| `pillar_decorated` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 61.0 KB | 761 | `assets/raw/kaykit/dungeon-remastered/pillar_decorated.gltf.glb` |
| `wall_arched` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 67.5 KB | 724 | `assets/raw/kaykit/dungeon-remastered/wall_arched.gltf.glb` |
| `wall_doorway` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 98.2 KB | 1.068 | `assets/raw/kaykit/dungeon-remastered/wall_doorway.glb` |
| `floor_tile_large` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 27.4 KB | 188 | `assets/raw/kaykit/dungeon-remastered/floor_tile_large.gltf.glb` |
| `shelf_small_candles` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 29.3 KB | 231 | `assets/raw/kaykit/dungeon-remastered/shelf_small_candles.gltf.glb` |
| `key` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 23.9 KB | 160 | `assets/raw/kaykit/dungeon-remastered/key.gltf.glb` |
| `coin_stack_medium` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 62.5 KB | 968 | `assets/raw/kaykit/dungeon-remastered/coin_stack_medium.gltf.glb` |
| `staff` | [Character Pack Adventures](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) | gltf + bin + png | 21.1 KB | 440 | `assets/raw/kaykit/character-pack-adventures/staff.gltf` |
| `wand` | [Character Pack Adventures](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) | gltf + bin + png | 8.8 KB | 150 | `assets/raw/kaykit/character-pack-adventures/wand.gltf` |
| `sword_shield_gold` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 46.6 KB | 542 | `assets/raw/kaykit/dungeon-remastered/sword_shield_gold.gltf.glb` |
| `arch` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 31.1 KB | 436 | `assets/raw/kaykit/halloween-bits/arch.gltf` |
| `arch_gate` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 63.8 KB | 868 | `assets/raw/kaykit/halloween-bits/arch_gate.gltf` |
| `shrine_candles` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 22.1 KB | 360 | `assets/raw/kaykit/halloween-bits/shrine_candles.gltf` |
| `plaque_candles` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 24.6 KB | 418 | `assets/raw/kaykit/halloween-bits/plaque_candles.gltf` |
| `tree_dead_medium` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 8.5 KB | 216 | `assets/raw/kaykit/halloween-bits/tree_dead_medium.gltf` |

#### Pohon/batu

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `tree_single_A` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 6.2 KB | 50 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/tree_single_A.gltf` |
| `tree_single_B` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 10.2 KB | 220 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/tree_single_B.gltf` |
| `trees_A_small` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 30.8 KB | 432 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/trees_A_small.gltf` |
| `trees_A_medium` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 33.9 KB | 480 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/trees_A_medium.gltf` |
| `trees_A_large` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 58.7 KB | 864 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/trees_A_large.gltf` |
| `trees_B_small` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 24.6 KB | 660 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/trees_B_small.gltf` |
| `trees_B_medium` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 39.2 KB | 1.100 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/trees_B_medium.gltf` |
| `trees_B_large` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 53.7 KB | 1.540 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/trees_B_large.gltf` |
| `rock_single_A` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 4.2 KB | 18 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/rock_single_A.gltf` |
| `rock_single_B` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 4.6 KB | 26 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/rock_single_B.gltf` |
| `rock_single_C` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 5.1 KB | 40 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/rock_single_C.gltf` |
| `rock_single_D` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 4.3 KB | 22 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/rock_single_D.gltf` |
| `rock_single_E` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 7.2 KB | 71 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/rock_single_E.gltf` |

#### Jembatan/gerbang

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `building_bridge_A` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 27.9 KB | 604 | `assets/raw/kaykit/medieval-hexagon/buildings/neutral/building_bridge_A.gltf` |
| `building_bridge_B` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 27.9 KB | 604 | `assets/raw/kaykit/medieval-hexagon/buildings/neutral/building_bridge_B.gltf` |
| `fence_wood_straight` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 17.7 KB | 212 | `assets/raw/kaykit/medieval-hexagon/buildings/neutral/fence_wood_straight.gltf` |
| `fence_wood_straight_gate` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 24.0 KB | 308 | `assets/raw/kaykit/medieval-hexagon/buildings/neutral/fence_wood_straight_gate.gltf` |
| `wall_straight_gate` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 53.2 KB | 820 | `assets/raw/kaykit/medieval-hexagon/buildings/neutral/wall_straight_gate.gltf` |

#### Prop kecil

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `barrel` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 18.2 KB | 240 | `assets/raw/kaykit/medieval-hexagon/decoration/props/barrel.gltf` |
| `crate_A_big` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 9.8 KB | 132 | `assets/raw/kaykit/medieval-hexagon/decoration/props/crate_A_big.gltf` |
| `crate_open` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 14.8 KB | 260 | `assets/raw/kaykit/medieval-hexagon/decoration/props/crate_open.gltf` |
| `sack` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 6.1 KB | 92 | `assets/raw/kaykit/medieval-hexagon/decoration/props/sack.gltf` |
| `tent` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 8.9 KB | 86 | `assets/raw/kaykit/medieval-hexagon/decoration/props/tent.gltf` |
| `flag_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 5.4 KB | 48 | `assets/raw/kaykit/medieval-hexagon/decoration/props/flag_blue.gltf` |
| `weaponrack` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 5.8 KB | 42 | `assets/raw/kaykit/medieval-hexagon/decoration/props/weaponrack.gltf` |
| `target` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 9.9 KB | 156 | `assets/raw/kaykit/medieval-hexagon/decoration/props/target.gltf` |
| `bucket_water` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 9.8 KB | 128 | `assets/raw/kaykit/medieval-hexagon/decoration/props/bucket_water.gltf` |
| `chest` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 79.5 KB | 728 | `assets/raw/kaykit/dungeon-remastered/chest.glb` |
| `lantern_standing` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 15.1 KB | 264 | `assets/raw/kaykit/halloween-bits/lantern_standing.gltf` |
| `lantern_hanging` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 22.0 KB | 472 | `assets/raw/kaykit/halloween-bits/lantern_hanging.gltf` |
| `post_lantern` | [Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) | gltf + bin + png | 30.0 KB | 568 | `assets/raw/kaykit/halloween-bits/post_lantern.gltf` |

#### Langit/awan

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `cloud_big` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 17.5 KB | 672 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/cloud_big.gltf` |
| `cloud_small` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 10.9 KB | 366 | `assets/raw/kaykit/medieval-hexagon/decoration/nature/cloud_small.gltf` |

**Total kandidat KayKit: 88 model · 3,48 MB mentah (gltf/bin/glb; 11 PNG atlas 14–24 KB = 171 KB tidak termasuk) · 52.870 segitiga.**

## Kandidat model Quaternius (Ultimate Nature Pack)

Semua dari Quaternius · Lisensi **CC0 1.0** · Atribusi **tidak wajib**. Format mentah OBJ + MTL (warna flat per material, tanpa tekstur); ukuran OBJ teks jauh mengecil setelah konversi ke glTF biner + kompresi di Fase 8. Segitiga dihitung dari baris `f` (poligon n-sisi = n−2 segitiga). Warna akan diganti palet terpusat di Fase 9 agar senada dengan KayKit.

#### Skill Tree (pilih satu di Fase 8)

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `CommonTree_1` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 135.2 KB | 2.888 | `assets/raw/quaternius/ultimate-nature/CommonTree_1.obj` |
| `CommonTree_2` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 138.1 KB | 2.952 | `assets/raw/quaternius/ultimate-nature/CommonTree_2.obj` |
| `Willow_4` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 71.6 KB | 1.568 | `assets/raw/quaternius/ultimate-nature/Willow_4.obj` |

#### Pohon/batu (variasi alam)

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `Willow_2` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 129.0 KB | 2.752 | `assets/raw/quaternius/ultimate-nature/Willow_2.obj` |
| `PineTree_3` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 111.3 KB | 2.392 | `assets/raw/quaternius/ultimate-nature/PineTree_3.obj` |
| `BushBerries_1` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 41.2 KB | 892 | `assets/raw/quaternius/ultimate-nature/BushBerries_1.obj` |
| `Bush_1` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 16.2 KB | 364 | `assets/raw/quaternius/ultimate-nature/Bush_1.obj` |
| `Rock_Moss_4` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 6.1 KB | 128 | `assets/raw/quaternius/ultimate-nature/Rock_Moss_4.obj` |
| `Rock_Moss_6` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 5.2 KB | 116 | `assets/raw/quaternius/ultimate-nature/Rock_Moss_6.obj` |
| `TreeStump_Moss` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 10.7 KB | 232 | `assets/raw/quaternius/ultimate-nature/TreeStump_Moss.obj` |
| `WoodLog_Moss` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 30.2 KB | 614 | `assets/raw/quaternius/ultimate-nature/WoodLog_Moss.obj` |
| `Flowers` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 19.9 KB | 408 | `assets/raw/quaternius/ultimate-nature/Flowers.obj` |
| `Plant_3` | [Ultimate Nature Pack](https://quaternius.itch.io/150-lowpoly-nature-models) | obj + mtl | 26.9 KB | 600 | `assets/raw/quaternius/ultimate-nature/Plant_3.obj` |

**Total kandidat Quaternius: 13 model · 741,4 KB mentah (OBJ teks) · 15.906 segitiga.**

## Dipakai di dunia 3D (Fase 8, diperbarui setelah desain ulang satu pulau)

Sumber kebenaran: `content/world-assets.json` (paket, penulis, lisensi, model, kit). `yarn world:assets` (`scripts/world-assets/build.mjs`) membangun kit GLB dan tipe TypeScript dari berkas itu, dan panel **Credits** di `/world` dibuat dari berkas yang sama.

| Kit (berkas) | Model | Ukuran mentah | Ukuran GLB (meshopt) | gzip HTTP | Dimuat |
|---|---:|---:|---:|---:|---|
| `public/world/models/core.glb` | 25 | 1.524.311 B | 570.608 B | 371.588 B | saat `/world` dibuka |
| `public/world/models/vault.glb` | 6 | 381.613 B | 130.836 B | 82.639 B | saat Hidden Vault pertama dibuka/disorot |
| **Total** | **31** | **1,91 MB** | **0,70 MB** | **0,45 MB** | anggaran 10 MB |

- **core**: `building_castle_blue`, `building_tower_A_blue`, `building_tavern_blue`, `building_well_blue`, `flag_blue`, `barrel`, `crate_A_big`, `sack`, `tree_single_A`, `trees_A_medium`, `rock_single_A`, `rock_single_C`, `cloud_big`, `cloud_small` (Medieval Hexagon) · `lantern_standing` (Halloween Bits) · `spellbook_open`, `mug_full` (Adventures) · `keg`, `stool` (Dungeon Remastered) · `CommonTree_1`, `PineTree_3`, `Bush_1`, `BushBerries_1`, `Rock_Moss_4`, `Flowers` (Quaternius Ultimate Nature).
- **vault**: `floor_tile_large`, `torch_lit`, `chest_gold`, `coin_stack_medium` (Dungeon Remastered) · `arch_gate`, `shrine_candles` (Halloween Bits).
- `hex_grass` dikeluarkan dari kit setelah desain ulang (`docs/migrasi/17-satu-pulau.md`): permukaan pulau kini terrain prosedural (vertex color), bukan petak hex.
- Kandidat lain di atas tetap disetujui dan berkas mentahnya tetap di `assets/raw/`, tetapi belum dipakai. Untuk memakainya cukup menambah baris di `content/world-assets.json`.
- Ukuran mentah dihitung per model (glTF + bin + tekstur, atau OBJ + MTL), sehingga atlas yang dipakai bersama ikut terhitung berulang. Di kit, atlas tersebut hanya disimpan sekali (`dedup`).

## Celah dan cara mengisinya

| Kebutuhan | Temuan | Usulan (perlu persetujuan) |
|---|---|---|
| Papan quest (stasiun Proyek) | Tidak ada di KayKit, Kenney Starter Kit, maupun 4 paket Quaternius yang diunduh (MegaKit Fantasy Props hanya punya `Stall_Empty`, `BookStand`, `Scroll_1`, bertekstur). "Notice board" CC0 yang ditemukan buatan AI (DITOLAK). | **Rakitan**: 2× `post` (KayKit) + papan kotak flat-color + kertas quest dari bidang datar (jumlah = jumlah proyek, warna dari token). |
| Skill Tree (stasiun Skill) | **Terisi**: `CommonTree_1/2` atau `Willow_4` (Ultimate Nature), pohon lebar ±2,5–3 unit. | Pakai model, ditambah simpul skill (bola/oktahedron flat) per kategori di ujung cabang. |
| Kotak surat (stasiun Kontak) | Tidak ada di KayKit maupun Quaternius yang diperiksa. | **Geometri sendiri**: tiang (`post`) + kotak dengan atap setengah silinder, flat color (± 100 segitiga). |
| Kristal (dekorasi, ruangan rahasia) | Tidak ada di paket gratis yang diperiksa (permata KayKit hanya di tier berbayar). | **Geometri sendiri**: oktahedron/ikosahedron yang diregangkan, `flatShading`, emissive di Fase 9. |
| Pulau (permukaan + batu bawah) | Tidak ada pulau utuh CC0 yang bisa dijangkau (lihat `docs/migrasi/16-evaluasi-ulang.md`). | **Terrain prosedural**: satu mesh halus berbukit dengan pantai dan batu meruncing, vertex color dari token, 0 KB aset (`island-geometry.ts`). |
| Langit | — | Gradien prosedural, tanpa berkas. |

## Perlu Diunduh Manual

Tidak ada yang **wajib** diunduh manual untuk usulan saat ini. Daftar ini hanya untuk opsi tambahan:

| Paket | URL | Folder tujuan | Catatan |
|---|---|---|---|
| Quaternius Medieval Village Pack (versi lama) | https://quaternius.com/packs/medievalvillage.html → tombol Download (Google Drive) | `assets/raw/quaternius/medieval-village/` (+ lisensi dari zip) | Opsional. Hanya berguna jika ingin bangunan Quaternius flat-color; bangunan KayKit sudah mencukupi. |
| Kenney Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | `assets/raw/kenney/fantasy-town-kit/` | Cadangan, tidak diusulkan. |
| Mixamo (animasi karakter, tahap lanjutan) | https://www.mixamo.com (butuh login Adobe) | `assets/raw/mixamo/` | Tidak dipakai di tahap ini. |
| VRoid Hub/Studio (karakter, tahap lanjutan) | https://hub.vroid.com (butuh login; lisensi per model berbeda) | `assets/raw/vroid/` | Tidak dipakai di tahap ini. |

## DITOLAK

| Kandidat | Sumber | Alasan |
|---|---|---|
| "Village notice board" (Summer Engine) | https://www.summerengine.com/asset-store/village-notice-board-9f4aa908 | Dilabeli CC0, tetapi hasil generator text-to-3D (asal-usul data latih tidak jelas) dan bergaya toon cel-shaded, tidak sesuai flat color. |
| Floating island gratis di CGTrader (mis. "stylized low poly floating island with small house", "diorama lowpoly lighthouse") | https://www.cgtrader.com/free-3d-models/exterior/other/stylized-low-poly-floating-island-with-small-house | Lisensi "Royalty Free" CGTrader, bukan CC0. Beberapa listing menyatakan dibuat dengan AI. Gaya juga berbeda dari paket utama. |
| `building_church_*` (semua varian warna) | KayKit Medieval Hexagon Pack | Keputusan pemilik: jangan pernah memakai gereja. Berkas dihapus dari `assets/raw/`. |
| Salinan paket KayKit/Quaternius di situs pihak ketiga | mis. situs "unity asset collection" | Bukan distribusi resmi; sebagian menyatakan "hanya untuk belajar, bukan komersial". Hanya sumber resmi (GitHub KayKit, itch.io, situs penulis) yang dipakai. |
| Poly Pizza (per model) | https://poly.pizza | Tidak ditolak secara umum, tetapi lisensinya berbeda per model (CC0 atau CC-BY) dan situsnya masih HTTP 403 dari sandbox (2026-10-12). Dipakai hanya jika ada kebutuhan spesifik, dengan pemeriksaan per model. |
