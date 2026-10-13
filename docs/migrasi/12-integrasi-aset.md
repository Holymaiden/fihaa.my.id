# Fase 8 — Integrasi Aset

Branch: `claude/clever-albattani-e7tn9x` (PR Holymaiden/fihaa.my.id#216).

## Ringkasan

- Geometri abu-abu diganti 32 model yang disetujui (KayKit + Quaternius Ultimate Nature). Model dikemas dalam **2 kit GLB**:
  - `core.glb`: 572.824 B, dimuat saat `/world` dibuka
  - `vault.glb`: 130.836 B, dimuat **hanya** saat Hidden Vault pertama dibuka atau disorot
- Total aset 3D **0,70 MB** (gzip HTTP 0,45 MB), dari 1,93 MB mentah. Anggaran 10 MB terpakai sekitar 7%.
- Papan quest, simpul skill, kotak surat, dan kristal dirakit dari geometri sendiri, sesuai keputusan Fase 6. Jumlah catatan quest = jumlah proyek (maks. 12); jumlah simpul skill = jumlah kategori skill.
- Petak hex, dekorasi, dan awan memakai instancing.
- Panel **Credits** dibuat otomatis dari `content/world-assets.json`.
- Bukti: `bukti/12-integrasi-aset.jpg` (tampilan pulau, Quest Board, Hidden Vault, Skill Tree), `bukti/12-kredit.png`, `bukti/12-ukuran-aset.json`.

## Pipeline

```
content/world-assets.json          # paket (penulis, lisensi, URL) + model (sumber, kit)
        │  yarn world:assets  (scripts/world-assets/build.mjs)
        ├─ glTF/GLB  → NodeIO.read
        ├─ OBJ+MTL   → obj-to-document.mjs (Kd linear → baseColorFactor, normal flat)
        ├─ mergeDocuments → satu node teratas per model, dinamai sesuai model
        ├─ unpartition · dedup · prune · weld · meshopt(level 'medium')
        ├─ public/world/models/<kit>.glb
        ├─ gltfjsx --types --keepnames → src/modules/world/assets/kits.generated.ts
        └─ docs/migrasi/bukti/12-ukuran-aset.json
```

| Alat | Versi | Catatan verifikasi |
|---|---|---|
| `@gltf-transform/core/extensions/functions` | 4.5.1 (dev) | Tanda tangan `meshopt({encoder, level})`, `mergeDocuments`, `unpartition`, `dedup`, `prune`, `weld` dibaca dari `functions/dist/index.d.ts`. |
| `meshoptimizer` | 1.3.0 (dev) | `MeshoptEncoder.ready` sebelum menulis. |
| `gltfjsx` | 6.5.3 (dev) | Dipakai untuk menghasilkan tipe `CoreKitGLTF`/`VaultKitGLTF` (nama node & material) dari kit yang sudah jadi. Komponen JSX hasilnya tidak dipakai karena penempatan diatur di `config/props.ts`. |

### Draco atau meshopt?

**Meshopt.** Alasannya ada di kode drei 10.7.9 (`core/Gltf.js`):
- `useGLTF` memasang `MeshoptDecoder` dari `three-stdlib`. Decoder ini sudah dibundel di chunk JS, jadi tidak ada request tambahan.
- Draco default-nya mengambil decoder dari `https://www.gstatic.com/draco/...`. Itu berarti ada domain eksternal, request tambahan, dan titik gagal baru.

`useKit()` memanggil `useGLTF(url, false, true)`: Draco mati, meshopt hidup. Uji runtime memastikan decoder bekerja. Kedua kit dimuat dan dirender tanpa error, dan GLB berisi `EXT_meshopt_compression` + `KHR_mesh_quantization`. Satu-satunya jaringan yang terpakai adalah `core.glb` dan `vault.glb` dari origin sendiri.

## Ukuran sebelum/sesudah

| Kit | Model | Mentah | GLB | gzip (dikirim server) |
|---|---:|---:|---:|---:|
| core | 26 | 1.545.516 B | 572.824 B (−63%) | 372.302 B |
| vault | 6 | 381.613 B | 130.836 B (−66%) | 82.639 B |
| **Total** | **32** | **1,93 MB** | **0,70 MB** | **0,45 MB** |

Anggaran ≤ 10 MB setelah kompresi: **terpenuhi** (0,70 MB). Tekstur hanya 5 atlas KayKit (15–16 KB tiap atlas). Atlas yang identik antar-model digabung oleh `dedup`.

Chunk JS three untuk `/world` naik dari 969.265 B menjadi 1.047.573 B (gzip 253.596 → 276.464 B) karena GLTFLoader, decoder meshopt, dan `Clone` ikut masuk. Chunk ini tetap hanya dimuat di `/world`.

## Integrasi per stasiun

| Stasiun | Model | Rakitan sendiri (warna token) |
|---|---|---|
| Guild (pusat) | `building_castle_blue` ×2,5, 2× `building_tower_A_blue`, `building_well_blue`, `flag_blue`, `barrel`, `crate_A_big`, `lantern_standing` | — |
| Quest Board | `barrel`, `crate_A_big`, `sack`, `lantern_standing` | papan + atap + catatan (`--color-world-wood`, `--color-world-paper`) |
| Skill Tree | `CommonTree_1` ×2,2, `lantern_standing` | simpul oktahedron per kategori (`--color-world-skill-node`) |
| Travel Journal | `stool` (podium), `spellbook_open`, `lantern_standing`, `sack` | — |
| Tavern Mailbox | `building_tavern_blue`, `keg`, `stool`, `mug_full`, `barrel` | kotak surat (`--color-world-mailbox`, `--color-world-wood`) |
| Hidden Vault | `floor_tile_large`, `arch_gate`, `shrine_candles`, `torch_lit`, `chest_gold`, `coin_stack_medium` (kit `vault`, lazy) | kristal (`--color-world-crystal`), langsung tampil sebelum kit vault dimuat |

Pulau dibangun dari petak `hex_grass` (guild 3 cincin = 37 petak, stasiun 2 cincin = 19 petak, vault 1 cincin = 7 petak). Di bawahnya ada kerucut batu prosedural. Skala disamakan lewat konstanta `HEX_PACK_SCALE = 2.5` dan `DUNGEON_PACK_SCALE = 0.5` di `config/props.ts`, karena kedua paket KayKit memakai skala berbeda.

## Instancing dan interaksi

- `InstancedModel` membuat satu `InstancedMesh` per bagian mesh model. Instancing dipakai untuk:
  - 120 petak hex untuk semua pulau (satu draw call)
  - pohon, semak, batu, dan bunga, dikelompokkan per model lintas pulau
  - 6 awan
- Klik petak hex memakai `instanceId` untuk menentukan pemilik pulau: petak stasiun membuka stasiun itu, petak guild kembali ke tampilan pulau. Hover pada petak menyorot stasiunnya (cincin seleksi heksagonal berwarna `--color-world-station-hover`/`-active`).
- Model sekali pakai memakai `<Clone>` dari drei, jadi geometri dan material dibagi dengan kit tanpa salinan.

## Lazy load (bukti runtime, Playwright)

```
after load:  core.glb 200 (gzip, 572.824 B)
after vault: core.glb, vault.glb 200 (gzip, 130.836 B)
```

`vault.glb` tidak diminta sampai tombol/pulau Hidden Vault dibuka atau disorot (`vaultRequested` di store). Seluruh scene (three, drei, loader) tetap berada di chunk `next/dynamic`.

## Kredit

- `getWorldCredits()` (`src/lib/content/world.ts`) membaca `content/world-assets.json` dan menghitung jumlah model per paket. Paket tanpa model tidak ditampilkan.
- Tombol "Credits" ada di kanan atas (HP) atau kiri bawah (desktop) dan membuka `<dialog>` modal yang bisa ditutup dengan Esc atau tombol Close. Esc di dalam dialog hanya menutup dialog, tidak ikut menutup panel stasiun (diuji: `after esc: dialog false panel true`).
- Isi saat ini: KayKit Medieval Hexagon (16), Dungeon Remastered (6), Halloween Bits (3), Adventures (2), Quaternius Ultimate Nature (6). Semua CC0 1.0, dengan tautan ke penulis dan lisensi.

## Hasil cek

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau.
- Isolasi three (`next start` + Playwright; chunk three `2iwbdzbxdcp40.js`): `/`, `/2d`, `/2d/about`, `/2d/projects`, `/2d/contact` → **tidak**; `/world` → ya.
- Tidak ada error konsol dari kode kita (hanya peringatan `THREE.Clock` dari R3F, peringatan preload CSS dari Next, dan skrip analitik yang diblokir sandbox).

## Pertanyaan Terbuka

1. Rumput petak hex terlihat kuning-zaitun di bawah pencahayaan sementara. Warna dan cahaya diselesaikan di Fase 9 (palet terpusat).

## Self-review Fase 8

1. Hanya aset yang disetujui yang dipakai; setiap model punya baris di `ASSETS.md` dan `content/world-assets.json`.
2. Kompresi meshopt sudah diverifikasi: decoder berasal dari three-stdlib, tanpa CDN, dan model terbukti dimuat di browser. Draco sengaja dimatikan, dan alasannya dicatat.
3. gltfjsx dipakai untuk tipe. Nama model tervalidasi saat compile (`CoreModelName`/`VaultModelName`) dan saat runtime (`getModelNode` melempar error bila hilang).
4. Instancing dipakai untuk petak, dekorasi, dan awan. Lazy load dipakai untuk vault. Kredit otomatis dari data atribusi.
5. Ukuran sebelum/sesudah diukur dari berkas (`12-ukuran-aset.json`); 0,70 MB jauh di bawah anggaran 10 MB.
6. Teks UI baru ("Credits", dsb.) ada di `content/world.ts`; warna rakitan dari token CSS; tidak ada `any`.
7. type-check, lint, dan build hijau; `/` dan `/2d/*` bebas three.
8. Belum diukur: fps dan draw call aktual (Fase 10).
