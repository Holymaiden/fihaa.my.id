# Air, TAA, God Rays, Awan Volumetrik, dan Aurora

Branch: `claude/zen-ride-ntbnug`. Lanjutan `19-dunia-hidup.md`.

## Keputusan pemilik (2026-10-13)

| Pertanyaan di laporan 19 | Jawaban |
|---|---|
| Musik prosedural | Sudah OK |
| Tur otomatis setelah 50 dtk | Dipertahankan |
| TAA, god rays, awan volumetrik, aurora | Dikerjakan |

Umpan balik tambahan: "air dari kolam ke air terjun masih sangat jelek".

## 1. Air (kolam → sungai → air terjun)

- **Sungai berkelok**: jalurnya kurva Catmull-Rom melalui titik-titik meander (`STREAM_PATH`, `toStream`, `streamHalfWidth` di `config/island.ts`). Sungai menyempit di tikungan dan melebar di bibir air terjun. Dasar sungai, mask air, rumput, dan viewpoint semuanya memakai jalur yang sama.
- **Shader air baru** (`water-shaders.ts`):
  - riak searah arus yang bergerak ke hilir dan makin cepat menjelang tepi;
  - pantulan langit (fresnel) dan kilau matahari pada puncak riak (cukup terang untuk bloom);
  - buih di tepi, garis arus deras, dan jeram putih sebelum bibir air terjun;
  - lubang-lubang tetes saat hujan, serta riak saat air diklik;
  - tepi air memudar lembut di atas tanah, tanpa garis keras.
- **Air terjun**:
  - lapisan bening di bibir yang memantulkan langit, lalu pecah menjadi garis-garis putih;
  - sisi tidak beraturan dan lapisan kedua di belakang supaya terasa tebal;
  - percikan lebih lembut;
  - menulis depth supaya awan volumetrik berada di belakangnya.
- **Tepian** (`water-banks.tsx`):
  - batu di kedua tepi sungai dan mengelilingi kolam, dengan warna bervariasi dan sebagian berlumut;
  - batu besar yang membingkai bibir air terjun;
  - alang-alang yang ikut bergoyang angin, dan daun teratai.
- Pohon yang tadinya berdiri di jalur sungai dipindah, dan kristal di dekat air terjun digeser ke tepian.

## 2. Rendering

| Fitur | Implementasi | Tingkat |
|---|---|---|
| **TAA** | `temporal-aa.tsx`: kamera digeser sub-piksel (Halton 2,3, 8 posisi), dicampur dengan riwayat (88%), dan riwayat di-clamp ke rentang warna 3×3 tetangga agar tidak ada ghosting. Menggantikan MSAA dan sekaligus menghaluskan noise AO dan awan. | high |
| **God rays** | Efek GodRays dari piringan matahari (`sun-disc.tsx`, tepat di posisi matahari langit). Hanya siang dan saat cerah. | high |
| **Awan volumetrik** | `volumetric-clouds.tsx`: raymarch 20 langkah melalui lapisan noise 3D (y −52…−24) dengan bayangan diri ke arah matahari, *silver lining*, dan jitter per piksel yang dihaluskan TAA. Raymarch dihentikan di depth scene, dan awan jauh menyatu dengan langit. Cuaca buruk membuat awan lebih tebal. | high |
| **Aurora** | Di shader langit: tiga tirai bergelombang dengan berkas vertikal di langit utara, warna `--color-world-aurora-low/high`. Hanya malam dan memudar saat mendung. | semua |

Urutan post (high): N8AO → awan volumetrik → TAA → tetes lensa, god rays, bloom → tone mapping Neutral → vignette → grain → saturasi. Tingkat *low* tetap memakai SMAA tanpa AO, awan volumetrik, TAA, dan god rays.

**Perbaikan tambahan:** `sky-dome` sebelumnya membuat objek uniform baru setiap tema berubah, padahal three.js tetap memakai objek yang dipakai saat kompilasi. Sekarang uniform-nya stabil dan nilainya diperbarui di tempat.

## Bukti

- `bukti/20-pulau-siang.jpg`: island view siang, sungai berkelok berbatu, lapisan awan volumetrik di belakang
- `bukti/20-air-terjun-awan.jpg`: air terjun di depan awan volumetrik
- `bukti/20-pulau-malam.jpg`: malam, awan volumetrik gelap
- `bukti/20-aurora.jpg`: aurora (POV melihat ke langit utara)

## Hasil cek

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau.
- Console bersih. Peringatan GodRays soal `autoClear` sudah diatasi.
- `/`, `/2d`, `/2d/about`, `/2d/projects` tetap tidak memuat three.js.
- fps nyata belum terukur karena sandbox tidak punya GPU. Fitur berat hanya aktif di *high*, dan otomatis turun ke *low* bila frame lambat. `?post=low|high|off` tersedia untuk membandingkan.

## Checklist manual

- [ ] Laptop: `?debug=stats` di *high*. Bila fps < 50, bandingkan dengan `?post=low`.
- [ ] Siang cerah: hadapkan kamera ke matahari (explore, drag) → god rays terlihat di antara pohon dan kastel.
- [ ] Malam cerah: lihat ke langit utara → aurora bergerak.
- [ ] Gerakkan kamera cepat → tidak ada bayangan ganda (ghosting) yang mengganggu.
- [ ] Sungai: arus bergerak ke arah air terjun, ada kilau matahari, dan klik air memunculkan riak.

## Self-review

1. Keluhan air ditangani dari bentuk (meander, tepian), material (shader baru), hingga komposisi (batu bibir, air terjun berlapis).
2. Keempat fitur yang diminta selesai, semuanya implementasi sendiri. Tidak ada kode dari situs referensi.
3. Fitur berat dibatasi ke tingkat *high*. Konfigurasinya ada di `VISUAL.post` dan `VISUAL.volumetricClouds`.
4. Warna dari token, mutasi uniform lewat helper atau kelas Effect/Pass, dan tidak ada `any`.
