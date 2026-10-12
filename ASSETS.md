# Aset 3D — Daftar Kandidat dan Lisensi

Status: **KANDIDAT, menunggu persetujuan pemilik** (Fase 6). Belum ada aset yang dipakai di kode.
Keputusan acuan: `docs/migrasi/09-keputusan-dunia.md` (gaya *low-poly flat color*, kamera terbang, anggaran ≤ 10 MB setelah kompresi).
Laporan dan alasan pemilihan: `docs/migrasi/10-aset.md`. Pratinjau render: `docs/migrasi/bukti/10-pratinjau-aset.jpg`.

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
| Pelengkap | KayKit Furniture Bits 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Furniture-Bits-1.0 | CC0 1.0 | Tidak wajib | glTF (+ FBX, OBJ) | 2 model buku diunduh → `assets/raw/kaykit/furniture-bits/` |
| Pelengkap opsional | KayKit Forest Nature Pack (tier gratis) | https://kaylousberg.itch.io/kaykit-forest | CC0 (menurut halaman itch.io; berkas lisensi belum diperiksa) | Tidak wajib | FBX, GLTF, OBJ | **Perlu diunduh manual** (lihat bawah) |
| Tahap lanjutan | KayKit Character Pack: Adventures 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | CC0 (menurut daftar repo; berkas lisensi belum diperiksa) | Tidak wajib | — | Tidak diunduh (karakter belum dipilih) |
| Alternatif | Quaternius Medieval Village MegaKit (Standard, 176 model) | https://quaternius.com/packs/medievalvillagemegakit.html · https://quaternius.itch.io/medieval-village-megakit | CC0 (halaman itch.io) | Tidak wajib | FBX, OBJ, glTF; **bertekstur** | Perlu diunduh manual · tidak direkomendasikan sebagai utama |
| Alternatif | Quaternius Stylized Nature MegaKit (Standard, 68 model) | https://quaternius.com/packs/stylizednaturemegakit.html · https://quaternius.itch.io/stylized-nature-megakit | CC0 (halaman itch.io) | Tidak wajib | FBX, OBJ, glTF; **bertekstur** | Perlu diunduh manual · tidak direkomendasikan sebagai utama |
| Alternatif | Quaternius Fantasy Props MegaKit (Standard, 94 model) | https://quaternius.itch.io/fantasy-props-megakit | CC0 (halaman itch.io) | Tidak wajib | FBX, OBJ, glTF; 4 set tekstur | Perlu diunduh manual |
| Alternatif | Quaternius Ultimate Nature Pack / 150+ LowPoly Nature Models | https://quaternius.itch.io/150-lowpoly-nature-models · https://opengameart.org/content/lowpoly-nature-pack | CC0 | Tidak wajib | Blend, FBX, OBJ (**tanpa glTF**, perlu konversi) | Perlu diunduh manual |
| Cadangan | Kenney Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit · https://opengameart.org/content/fantasy-town-kit | CC0 | Tidak wajib ("Kenney.nl", opsional) | FBX, OBJ, glTF | Perlu diunduh manual |
| Cadangan | Kenney Nature Kit | https://kenney.nl/assets/nature-kit · https://opengameart.org/content/nature-kit | CC0 | Tidak wajib | FBX, OBJ (glTF belum dipastikan) | Perlu diunduh manual |
| Tidak diperlukan | Poly Haven HDRI langit | https://polyhaven.com/hdris | CC0 | Tidak wajib | HDR/EXR | Tidak dipakai: foto realistis bertentangan dengan gaya flat color. Langit dibuat gradien prosedural (0 KB). |
| Tidak diperlukan | ambientCG tekstur PBR | https://ambientcg.com | CC0 | Tidak wajib | PNG/JPG | Tidak dipakai: gaya flat color tidak memakai tekstur PBR. |
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
| `building_church_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 90.6 KB | 1.601 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_church_blue.gltf` |
| `building_tower_A_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 115.1 KB | 2.138 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_tower_A_blue.gltf` |
| `building_barracks_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 227.3 KB | 4.007 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_barracks_blue.gltf` |
| `banner_patternA_blue` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 24.6 KB | 110 | `assets/raw/kaykit/dungeon-remastered/banner_patternA_blue.gltf.glb` |
| `banner_shield_blue` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 53.8 KB | 639 | `assets/raw/kaykit/dungeon-remastered/banner_shield_blue.gltf.glb` |

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
| `table_medium_decorated_A` | [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | glb (tekstur tertanam) | 80.7 KB | 1.186 | `assets/raw/kaykit/dungeon-remastered/table_medium_decorated_A.gltf.glb` |
| `book_set` | [Furniture Bits](https://github.com/KayKit-Game-Assets/KayKit-Furniture-Bits-1.0) | gltf + bin + png | 14.3 KB | 196 | `assets/raw/kaykit/furniture-bits/book_set.gltf` |
| `book_single` | [Furniture Bits](https://github.com/KayKit-Game-Assets/KayKit-Furniture-Bits-1.0) | gltf + bin + png | 6.9 KB | 68 | `assets/raw/kaykit/furniture-bits/book_single.gltf` |

#### Kedai

| Nama | Paket (sumber) | Format | Ukuran mentah | Segitiga | Path |
|---|---|---|---:|---:|---|
| `building_tavern_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 169.9 KB | 2.992 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_tavern_blue.gltf` |
| `building_market_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 151.6 KB | 3.125 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_market_blue.gltf` |
| `building_well_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 44.4 KB | 726 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_well_blue.gltf` |
| `building_home_A_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 57.1 KB | 1.011 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_home_A_blue.gltf` |
| `building_windmill_blue` | [Medieval Hexagon Pack](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) | gltf + bin + png | 145.5 KB | 2.653 | `assets/raw/kaykit/medieval-hexagon/buildings/blue/building_windmill_blue.gltf` |
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

**Total kandidat KayKit: 85 model · 3.50 MB mentah (gltf/bin/glb; 9 salinan PNG atlas 16–24 KB = 141 KB tidak termasuk) · 52.873 segitiga.**

## Kebutuhan tanpa kandidat aset yang cocok

| Kebutuhan | Temuan | Usulan (perlu persetujuan) |
|---|---|---|
| Papan quest (stasiun Proyek) | Tidak ada di KayKit maupun di daftar isi Quaternius/Kenney yang bisa saya periksa. | Rakit dari `post`, `pallet`, `resource_lumber`, dan bidang kertas sederhana; atau geometri flat-color buatan sendiri. |
| Skill Tree (stasiun Skill) | Pohon KayKit berupa pinus kecil, tidak cocok sebagai "pohon skill" utama. | Geometri buatan sendiri: batang dan simpul per kategori skill, flat color. |
| Kotak surat (stasiun Kontak) | Tidak ada. | Geometri sederhana (kotak + silinder) atau papan `plaque` + `post`. |
| Kristal (dekorasi, ruangan rahasia) | Tidak ada di paket yang diunduh. | Geometri oktahedron flat color (emissive di Fase 9). |
| Bagian bawah pulau melayang | `hex_grass_bottom` hanya punya lapisan tanah tipis. | Kerucut batu low-poly buatan sendiri di bawah petak hex. |
| Langit | — | Gradien prosedural (shader/`Sky` sederhana), tanpa berkas. |

## Perlu Diunduh Manual

Domain berikut diblokir oleh kebijakan jaringan sandbox, dan sebagian halaman itch.io butuh klik "download"/"name your price". Unduh hanya jika paket itu disetujui:

| Paket | URL | Folder tujuan |
|---|---|---|
| KayKit Forest Nature Pack (FREE) | https://kaylousberg.itch.io/kaykit-forest | `assets/raw/kaykit/forest-nature/` (+ `LICENSE.txt` dari zip) |
| Quaternius Medieval Village MegaKit (Standard) | https://quaternius.itch.io/medieval-village-megakit | `assets/raw/quaternius/medieval-village-megakit/` |
| Quaternius Stylized Nature MegaKit (Standard) | https://quaternius.itch.io/stylized-nature-megakit | `assets/raw/quaternius/stylized-nature-megakit/` |
| Quaternius Fantasy Props MegaKit (Standard) | https://quaternius.itch.io/fantasy-props-megakit | `assets/raw/quaternius/fantasy-props-megakit/` |
| Kenney Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | `assets/raw/kenney/fantasy-town-kit/` |
| Mixamo (animasi karakter, tahap lanjutan) | https://www.mixamo.com (butuh login Adobe) | `assets/raw/mixamo/` |
| VRoid Hub/Studio (karakter, tahap lanjutan) | https://hub.vroid.com (butuh login; lisensi per model berbeda) | `assets/raw/vroid/` |

## DITOLAK

| Kandidat | Sumber | Alasan |
|---|---|---|
| "Village notice board" (Summer Engine) | https://www.summerengine.com/asset-store/village-notice-board-9f4aa908 | Dilabeli CC0, tetapi hasil generator text-to-3D (asal-usul data latih tidak jelas) dan bergaya toon cel-shaded, tidak sesuai flat color. |
| Floating island gratis di CGTrader (mis. "stylized low poly floating island with small house", "diorama lowpoly lighthouse") | https://www.cgtrader.com/free-3d-models/exterior/other/stylized-low-poly-floating-island-with-small-house | Lisensi "Royalty Free" CGTrader, bukan CC0. Beberapa listing menyatakan dibuat dengan AI. Gaya juga berbeda dari paket utama. |
| Salinan paket KayKit/Quaternius di situs pihak ketiga | mis. situs "unity asset collection" | Bukan distribusi resmi; sebagian menyatakan "hanya untuk belajar, bukan komersial". Hanya sumber resmi (GitHub KayKit, itch.io, situs penulis) yang dipakai. |
| Poly Pizza (per model) | https://poly.pizza | Tidak ditolak secara umum, tetapi lisensinya berbeda per model (CC0 atau CC-BY) dan situsnya tidak bisa dijangkau dari sandbox. Dipakai hanya jika ada kebutuhan spesifik, dengan pemeriksaan per model. |
