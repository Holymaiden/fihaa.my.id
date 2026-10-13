# Desain Ulang: Satu Pulau yang Diputar

Branch: `claude/clever-albattani-e7tn9x` (PR Holymaiden/fihaa.my.id#216). Dasarnya umpan balik dan keputusan di `16-evaluasi-ulang.md`: satu pulau diputar, terlihat halus, dan tidak membingungkan.

## Ringkasan

- **Satu pulau organik** menggantikan enam pulau petak hex. Pulau dibuat prosedural sebagai satu mesh halus: bukit landai, pantai berpasir, tebing, dan batu meruncing di bawah. Warnanya dari vertex color dan token, tanpa tekstur, 0 KB aset.
- **Navigasi seperti referensi**:
  - geser/drag pulau ke kiri-kanan untuk memutar; saat dilepas, pulau berhenti tepat di stasiun terdekat dan panelnya terbuka;
  - tombol ← → di layar dan panah keyboard berpindah ke stasiun berikutnya/sebelumnya;
  - daftar stasiun HTML, klik pada stasiun, dan Esc tetap berfungsi.
- Kamera tidak lagi diorbit manual. Ada tiga shot yang dihaluskan: seluruh pulau, close-up stasiun yang menghadap depan, dan vault. Semuanya menyesuaikan panel (geser kanan di desktop, geser atas di HP) dan layar sempit.
- **Hidden Vault** menjadi ceruk/batu menjorok di sisi belakang bawah pulau. Tidak terlihat dari tampilan awal; kristal, cahaya, dan partikelnya tetap menjadi satu-satunya nuansa misterius.
- **Tampilan halus**: tone mapping filmic (ACES, exposure 1,05), bayangan lembut (PCF soft) dari matahari, smooth normal, hemisphere fill, langit gradien, dan awan. Suasana siang/malam tetap mengikuti tema situs.
- Bukti:
  - `bukti/17-siang.jpg` dan `bukti/17-malam.jpg`: pulau, Quest Board, Hidden Vault, Skill Tree
  - `bukti/17-siang-hp.jpg` dan `bukti/17-malam-hp.jpg`: HP 390 px
  - `bukti/17-setelah-drag.png`
  - `public/images/og-world.jpg`: diperbarui

## Tata letak (`config/island.ts`)

| Elemen | Posisi |
|---|---|
| Kastel guild + 2 menara + bendera | tengah pulau |
| Quest Board | sudut 0° (menghadap kamera saat awal) |
| Skill Tree | 90° |
| Travel Journal | 180° |
| Tavern Mailbox | 270° |
| Hidden Vault | ceruk di 225°, 6 unit di bawah permukaan |
| Dekorasi | 30 pohon/semak/batu/bunga dengan posisi tetap, menjauhi area stasiun (instancing) |

Semua model berdiri di permukaan lewat `islandHeight(x, z)`, fungsi yang sama dengan pembentuk terrain. Model stasiun ditulis dalam "bingkai stasiun" (x kanan, z keluar), lalu diputar ke sudut stasiunnya (`island-frame.ts`).

## Interaksi (bukti Playwright, build produksi)

```
drag ke kiri 200 px → Skill Tree      (snap ke stasiun terdekat + panel terbuka)
ArrowRight          → Travel Journal
tombol "Previous"   → Skill Tree
Esc                 → panel tertutup
Hidden Vault        → panel vault, vault.glb baru dimuat saat itu
Tab/Enter/Esc       → fokus ke judul panel lalu kembali ke tombol stasiun (tidak berubah)
```

Klik yang mengakhiri drag tidak dianggap klik: event 3D memakai `event.delta > 6 px`, dan klik ke langit memakai `endedDragJustNow()`. Jadi melepas drag di langit tidak langsung menutup panel.

## Performa

Pengukuran dengan SwiftShader (sandbox tanpa GPU), jadi fps bukan acuan. Yang dilaporkan adalah metrik deterministik.

| Kondisi | Draw call | Segitiga |
|---|---:|---:|
| Pulau, bayangan dirender ulang tiap frame (awal) | 112 | 146.516 |
| Pulau, **ShadowUpdater** (peta bayangan hanya diperbarui saat pulau berputar, model dimuat, atau tema berubah) | **72** | **75.396** |
| Vault, sesudah | 48 | 75.661 |

- Aset siap: 1,07 dtk desktop; 3,4 dtk di HP yang diemulasi (CPU 4×, ±1 Mbps).
- JS `/world`: 1.796.328 B mentah / ±517 KB gzip; chunk three 1.013.693 B / 270.398 B gzip, tetap lazy.
- Aset 3D: `core.glb` 570.608 B (`hex_grass` dibuang) + `vault.glb` 130.836 B = **0,70 MB** (gzip 0,45 MB).
- Idle 10 detik: efek mati = **0 draw call**; efek hidup (awan, kristal) = 2.664 draw call (sebelumnya 3.360).
- Perlindungan HP lemah tetap ada: dpr adaptif (`PerformanceMonitor`). Kalau masih lambat di dpr 1, **bayangan dimatikan** (`onFallback`). Shadow map 1024 di layar sempit, 2048 di desktop.

Angka mentah: `bukti/17-pengukuran.txt`.

## Hasil cek

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau (`.next` dihapus dulu; `/world` statis).
- Isolasi three (chunk `347vjq60h57ec.js`): `/`, `/2d`, `/2d/about`, `/2d/projects`, `/2d/contact` → **tidak**; `/world` → ya.
- Fallback tanpa WebGL: pesan + tombol 2D, **tanpa** chunk three dan GLB, panel HTML berfungsi. Kegagalan memuat `core.glb` → error boundary. Keduanya diuji ulang setelah desain ulang.

## Berkas utama

```
src/modules/world/config/island.ts            # bentuk pulau, islandHeight, sudut stasiun, vault
src/modules/world/config/camera.ts            # 3 shot kamera, zoom layar sempit, geser untuk panel
src/modules/world/config/props.ts             # model guild/stasiun/vault/dekorasi/awan
src/modules/world/components/scene/
  island-geometry.ts   island-terrain.tsx     # mesh pulau prosedural + klik tanah dekat stasiun
  island-rig.tsx                              # putar: drag, snap, damping
  camera-director.tsx                         # kamera halus antar-shot
  island-station.tsx  guild-hall.tsx  island-decor.tsx  vault-ledge.tsx
  shadow-updater.tsx  pointer.ts  island-frame.ts
src/modules/world/hooks/use-station-turn.ts   # ← / →
src/modules/world/components/world-turn-controls.tsx
```

Dihapus: `config/layout.ts`, `world-islands.tsx`, `island-rock.tsx`, `camera-rig.tsx` (CameraControls), dan `station-object.tsx`. Token `--color-world-island-side`, `-grass-tint`, dan `-secret-tile` diganti token terrain (`grass-light`, `grass`, `sand`, `cliff`, `rock`, `rock-deep`); `rock` lama untuk batu Quaternius kini `stone`.

## Checklist manual tambahan (melengkapi `14-rilis.md`)

- [ ] Laptop: geser pulau dengan mouse → berputar mulus dan berhenti di stasiun; `?debug=stats` ≈ 60 fps.
- [ ] HP: geser dengan jari tidak ikut menggulir halaman; tombol ← → mudah ditekan; `?debug=stats` ≥ 30 fps. Kalau bayangan hilang, berarti fallback performa aktif.
- [ ] Tema terang/gelap → siang/malam.
- [ ] Hidden Vault terbuka dari daftar stasiun; vault tidak terlihat dari tampilan awal.

## Pertanyaan Terbuka

1. Teks petunjuk "Drag the island or use ← → to look around" hanya tampil di desktop. Di HP yang tampil hanya tombol ← →. Perlu juga di HP?
2. Satu bangunan landmark CC-BY dari Sketchfab tetap opsional (perlu diunduh manual atau domain Sketchfab dibuka).

## Self-review

1. Konsep satu pulau diputar sesuai jawaban pemilik; semua stasiun, vault, panel, keyboard, dan fallback tetap berfungsi (diuji).
2. Tampilan halus berasal dari terrain smooth, bayangan lembut, dan tone mapping, tanpa aset tambahan. Ukuran aset justru turun sedikit.
3. Satu optimasi baru terbukti dengan angka (ShadowUpdater: 112 → 72 draw call). Penguncian sudut mencegah pembaruan bayangan yang tidak perlu.
4. Teks UI baru ada di `content/world.ts`; warna dari token; tidak ada `any`; komentar kode berbahasa Inggris.
5. type-check, lint, build hijau; `/` dan `/2d/*` bebas three.
6. Belum bisa diukur di sini: fps nyata di perangkat (tetap di checklist).
