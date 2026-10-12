# Fase 10 — Persiapan Rilis

Branch: `claude/clever-albattani-e7tn9x` (PR Holymaiden/fihaa.my.id#216). **Belum di-merge dan belum di-deploy**, sesuai instruksi. Pengaturan Vercel tidak diubah.

## Ringkasan

- Pengukuran nyata pada build produksi (`next start` + Chromium headless). Angka mentah ada di `bukti/14-pengukuran.txt`.
- Dua optimasi diterapkan karena **terbukti perlu**:
  1. **DPR adaptif**: drei `PerformanceMonitor`, karena dpr 2 membuat frame 2,2× lebih lambat.
  2. **`frameloop="demand"` saat efek mati**: sebelumnya scene merender terus walau diam; sekarang 0 draw call saat idle.
- Fallback WebGL → 2D, error boundary scene, `error.tsx` rute, dan deteksi context lost.
- Metadata `/world`: title, description, canonical, Open Graph, dan Twitter dengan gambar `og-world.jpg` (render nyata 1200×630). `/world` masuk sitemap. Alias `/3d` → `/world`.
- Alat ukur untuk perangkat nyata: buka `/world?debug=stats` untuk melihat fps, draw call, segitiga, dan dpr.

## Batas pengukuran (penting)

Sandbox tidak punya GPU. WebGL dijalankan oleh **SwiftShader** (rasterisasi di CPU), sehingga **angka fps dari sandbox tidak mewakili laptop/HP sungguhan** (6–14 fps di sini, untuk scene yang di GPU biasa jauh di atas 60). Karena itu:
- yang dilaporkan sebagai angka pasti hanya metrik yang tidak bergantung GPU: draw call, segitiga, ukuran bundle, waktu muat, dan jumlah frame saat idle;
- fps dipakai hanya **relatif** (sebelum vs sesudah, dpr 1 vs 2) pada mesin yang sama;
- target **60 fps laptop / ≥30 fps HP** harus dicek manual di perangkat nyata dengan `?debug=stats` (lihat checklist).

## Hasil ukur

### Beban render (deterministik)

| Tampilan | Draw call | Segitiga | Geometri | Tekstur |
|---|---:|---:|---:|---:|
| Pulau (awal), desktop | 78 | 42.834 | 67 | 6 |
| Pulau (awal), HP 390 px | 75 | 42.346 | 67 | 6 |
| Hidden Vault | 22 | 14.780 | 77 | 8 |

Ini sudah ringan untuk GPU HP kelas menengah (umumnya aman di < 100–200 draw call dan < 100 rb segitiga), jadi **tidak ada optimasi geometri lanjutan** (merge/LOD) yang dibenarkan. Kandidat bila nanti perlu: meng-instance 12 catatan papan quest dan 6 simpul skill (−16 draw call).

### Bundle `/world` (JS yang dimuat, build produksi)

| Route | Berkas JS | Mentah | gzip |
|---|---:|---:|---:|
| `/` | 23 | 832.323 B | 262.849 B |
| `/2d` | 33 | 1.028.711 B | 336.496 B |
| `/world` | 20 | 1.837.563 B | 525.667 B |
| ↳ chunk three (`419cuss7ajz4h.js`, lazy) | 1 | 1.057.178 B | 279.988 B |

Aset 3D: `core.glb` 572.824 B + `vault.glb` 130.836 B (lazy) = **0,70 MB** (gzip 0,45 MB), di bawah anggaran 10 MB.

### Waktu muat (`performance` API; `world:assets-ready` = semua kit awal selesai dimuat)

| Skenario | TTFB | FCP | DOMContentLoaded | load | Aset siap |
|---|---:|---:|---:|---:|---:|
| Desktop 1280×800, jaringan lokal | 7 ms | 260 ms | 53 ms | 171 ms | **833 ms** |
| HP 390×844 dpr3, CPU 4× lebih lambat, ±1 Mbps / 150 ms (emulasi CDP) | 9 ms | 524 ms | 453 ms | 1.053 ms | **3.404 ms** |

Selama aset dimuat, panel HTML sudah bisa dipakai dan indikator "Loading assets N%" tampil.

### Optimasi 1 — DPR adaptif (terbukti perlu)

Sebelum optimasi, HP 390×844 tanpa throttle, SwiftShader:

| dpr | frame time | fps (relatif) |
|---|---:|---:|
| 1 | 77,3 ms | 13 |
| 2 | 170,7 ms | 6 |

Menggandakan dpr menaikkan waktu frame **2,2×**, jadi frame terikat **fill-rate**. Di GPU HP sungguhan pola ini sama (jumlah piksel ×4 pada dpr 2 dibanding dpr 1).

Tindakan: `dpr` dimulai dari `min(devicePixelRatio, 2)`, lalu drei `PerformanceMonitor` (`factor=1`, `step=0.2`, `flipflops=3`) menurunkannya selama fps di bawah batas (default 50/60) dan menaikkannya lagi bila lancar. Setelah 3 kali bolak-balik, dpr dikunci di 1 (`onFallback`). Di sandbox terlihat dpr turun 2 → 1,9 → 1,8 dalam ±15 dtk (`pixelRatio` di `14-pengukuran.txt`). Di perangkat yang mampu 60 fps, dpr tidak turun.

### Optimasi 2 — render on-demand saat efek mati (terbukti perlu)

Penghitung panggilan `drawElements/drawArrays*` WebGL selama 10 detik diam setelah aset siap:

| Kondisi | Sebelum | Sesudah |
|---|---|---|
| Efek mati (`prefers-reduced-motion`) | ±65 frame × ±75 draw call (frameloop selalu jalan), TaskDuration 0,18 dtk | **0 draw call**, TaskDuration 0,00 dtk |
| Efek hidup (awan/kristal bergerak) | terus merender | 5.070 draw call/10 dtk (sesuai harapan) |

Tindakan: `<Canvas frameloop={effects ? 'always' : 'demand'}>`. Kamera tetap mulus karena drei `CameraControls` memanggil `invalidate()` sendiri (dicek di `core/CameraControls.js`). Mutasi manual (`KitRecolor`, matriks/warna instance) ditambah `invalidate()`. Dampaknya: baterai HP lebih hemat untuk pengunjung yang memilih tanpa animasi.

## Ketahanan

| Kasus | Perilaku | Bukti |
|---|---|---|
| Browser tanpa WebGL (`--disable-webgl --disable-3d-apis`) | Pesan "This browser or device can not show the 3D world." + tombol "Open the 2D site". **Chunk three dan GLB tidak dimuat** (`useWebGLSupport` dicek sebelum `next/dynamic`). Daftar stasiun dan panel HTML tetap berfungsi. | `bukti/14-fallback-tanpa-webgl.png`; log: `canvas 0, three chunk loaded false, glb 0, panel still works: Skill Tree` |
| Scene error (mis. `core.glb` gagal dimuat) | `WorldErrorBoundary` menangkap error → "Something went wrong while drawing the 3D world." + tombol 2D; error dicatat di konsol | `bukti/14-fallback-error.png`; diuji dengan `page.route('**/core.glb', abort)` |
| WebGL context lost | event `webglcontextlost` → fallback error | kode (`world-scene.tsx` `onCreated`) |
| Error di luar scene | `src/app/world/error.tsx` menampilkan fallback yang sama | kode |

Teks fallback berasal dari `content/world.ts` (`fallback*`).

## Metadata, sitemap, redirect

| Item | Hasil (`curl` ke `next start`) |
|---|---|
| `<title>` | `3D World \| Fihaa Portfolio` |
| canonical | `https://fihaa.my.id/world` |
| Open Graph | `og:title`, `og:description`, `og:url`, `og:type`, `og:image` = `/images/og-world.jpg` 1200×630 + alt |
| Twitter | `summary_large_image` + gambar yang sama |
| Sitemap | `https://fihaa.my.id/world` (monthly, 0.9) ditambahkan |
| Redirect | `/3d` → `/world` (307, alias baru); `/projects` → `/2d/projects` (308) dan `/novel` → `/2d` (308) tetap jalan |
| robots | tidak berubah; `/world` dan `/world/models/*.glb` tidak diblokir |

## Hasil cek

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau setelah `.next` dihapus (`/world` statis `○`).
- Isolasi three (chunk `419cuss7ajz4h.js`): `/`, `/2d`, `/2d/about`, `/2d/projects`, `/2d/contact` → **tidak**; `/world` → ya.

## Checklist rilis manual (untuk pemilik)

Sebelum merge PR Holymaiden/fihaa.my.id#216:

- [ ] **Preview Vercel** dari PR terbangun hijau.
- [ ] **Laptop menengah**: buka `/world?debug=stats` (Chrome), diamkan 10 detik → fps ≈ 60, dpr tidak turun. Klik kelima stasiun; animasi terbang mulus.
- [ ] **HP menengah** (Android Chrome dan/atau iPhone Safari): `/world?debug=stats` → fps ≥ 30 (dpr boleh turun ke ±1–1,5). Ketuk tiap tombol stasiun, buka Hidden Vault (kit vault dimuat), panel bisa di-scroll, "Back to the island" berfungsi.
- [ ] **Keyboard** (desktop): Tab ke "Switch to 2D" → stasiun → Enter membuka panel → Esc menutup dan fokus kembali; Credits terbuka/tertutup dengan Enter/Esc.
- [ ] **Tema**: ganti terang/gelap di situs 2D lalu buka `/world` → suasana siang/malam.
- [ ] **Reduced motion** (setelan OS): `/world` menampilkan "Effects: off", kamera berpindah tanpa animasi.
- [ ] **Tanpa WebGL** (opsional: `chrome://flags` → nonaktifkan WebGL, atau Safari "Disable WebGL"): pesan fallback + tombol 2D.
- [ ] **Pratinjau tautan**: tempel URL preview `/world` di Slack/WhatsApp/Twitter Card Validator → gambar pulau tampil.
- [ ] **Kredit**: tombol Credits menampilkan 5 paket CC0 dengan tautan yang bisa dibuka.
- [ ] **Regresi 2D**: `/`, `/2d`, `/2d/projects/<slug>`, `/2d/blog`, `/2d/contact` tampil normal; redirect lama (`/projects`, `/about`) masih jalan.
- [ ] **Network tab** `/` dan `/2d`: tidak ada request chunk three atau `.glb`.
- [ ] Setelah merge & deploy: cek `https://fihaa.my.id/sitemap.xml` memuat `/world`.

## Pertanyaan Terbuka

1. fps nyata di laptop/HP belum bisa diukur dari sandbox (tanpa GPU). Mohon jalankan dua butir checklist perangkat dan kirimkan angka `?debug=stats`. Kalau HP di bawah 30 fps, langkah berikutnya sudah disiapkan: instancing catatan quest/simpul skill, `dpr` maksimum 1,5, dan mematikan `Sparkles` di layar sempit.
2. Tombol "Effects" tetap terlihat di layar fallback (tanpa efek apa pun). Tidak berbahaya, tetapi bisa disembunyikan bila mengganggu.
3. `/` kini tercatat dinamis (`ƒ`) di output build. Ini bukan dari fase ini (landing membaca cookie mode dunia sejak fase sebelumnya); dicatat untuk diketahui.

## Self-review Fase 10

1. Pengukuran nyata dilakukan untuk metrik yang bisa diukur di sandbox, dan batas SwiftShader dinyatakan terbuka. fps tidak diklaim memenuhi target.
2. Hanya dua optimasi, masing-masing dengan bukti sebelum/sesudah dari mesin yang sama.
3. Fallback tanpa WebGL tidak memuat three/GLB; error boundary diuji dengan kegagalan nyata (GLB diblokir).
4. Metadata/OG/sitemap/redirect diverifikasi dari HTML hasil `next start`, bukan hanya dari kode.
5. Teks baru ada di `content/world.ts`; tidak ada `any`; komentar kode berbahasa Inggris.
6. type-check, lint, build hijau; `/` dan `/2d/*` bebas three.
7. Tidak ada merge, deploy, atau perubahan pengaturan Vercel.

## Perbaikan build Vercel (2026-10-12)

- Gejala: deployment Vercel PR Holymaiden/fihaa.my.id#216 gagal. `yarn build` lokal (Node 20, 22, 24) dan clone bersih dengan `yarn install --frozen-lockfile` di Node 22 tetap berhasil, dan ukuran trace function hanya ±5 MB.
- Penyebab (direproduksi): dengan **Node 20**, `yarn install --frozen-lockfile` berhenti dengan `error camera-controls@3.1.2: The engine "node" is incompatible with this module. Expected version ">=22.0.0"`. `camera-controls` adalah dependensi `@react-three/drei` (sudah di lockfile sejak Fase 4), dan yarn v1 menolak paket yang `engines`-nya tidak cocok.
- Perbaikan tanpa mengubah pengaturan Vercel: `"engines": { "node": "22.x" }` di `package.json` (menurut dokumentasi Vercel, field ini diprioritaskan di atas pengaturan Node.js Version proyek) + `.nvmrc` berisi `22` untuk build lokal.
- Uji: clone bersih + Node 22 → install & build hijau. Node 20 kini langsung memberi pesan jelas bahwa proyek butuh 22.x.
