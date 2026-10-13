# Fase 7 — Greybox Dunia 3D

Branch: `claude/clever-albattani-e7tn9x` (PR Holymaiden/fihaa.my.id#216).
Dasar: daftar aset disetujui pemilik pada 2026-10-12 (KayKit 88 model + Quaternius Ultimate Nature 13 model + geometri sendiri). *Medieval Village Pack* lama tidak dipakai (jawaban pemilik: "tidak perlu").

## Ringkasan

- Lima stasiun dan kastel guild dibuat dari geometri abu-abu primitif (box, silinder, kerucut, ikosahedron, oktahedron). Belum ada model, tekstur, atau efek.
- Klik stasiun di 3D atau di daftar HTML akan menerbangkan kamera ke stasiun itu dan membuka panel konten. Klik langit/kastel, tombol "Back to the island", atau tombol **Esc** mengembalikan kamera ke tampilan pulau.
- Isi panel berasal dari fungsi pembaca konten (`src/lib/content/*`) yang dirangkum di server oleh `getWorldContent()`. Teks UI disimpan di `content/world.ts`, tidak ada yang ditulis langsung di komponen 3D.
- Tombol "Switch to 2D" selalu terlihat (z-index paling atas, di luar canvas, dan elemen pertama dalam urutan Tab).
- Bukti: `bukti/11-greybox.jpg` (desktop: tampilan pulau dan Hidden Vault; HP: tampilan pulau dan Tavern Mailbox).

## Stasiun

| Id | Nama | Isi panel | Bentuk greybox | Posisi |
|---|---|---|---|---|
| `projects` | Quest Board | Semua proyek (`getProjects`), terbaru dulu | papan di dua tiang | kiri depan |
| `skills` | Skill Tree | Skill per kategori (`getSkillsByCategory` + label di `content/skills.ts`) | batang + tajuk ikosahedron | kiri belakang, lebih tinggi |
| `experience` | Travel Journal | Karier, pendidikan, organisasi (`getCareers`, `getEducation`, `getOrganizations`) | podium + buku | kanan belakang |
| `contact` | Tavern Mailbox | Tautan kontak + resume (`getContactLinks`, `getResumeUrl`) | kedai + kotak surat | kanan depan |
| `secret` | Hidden Vault | Proyek pilihan (`getVaultProjects`) | kristal di bawah gapura | **di bawah pulau guild** |
| — | Guild Hall | — (klik = kembali ke tampilan pulau) | kastel: badan + menara tengah + 4 menara | tengah |

`WorldStationId` di `src/lib/content/types.ts` kini punya id kelima, `secret`. `WorldStation` ditambah field `title`, `summary`, `emptyMessage`, dan `path2d`.

### Kriteria ruangan rahasia (diserahkan ke saya)

`is_featured` bernilai `true` di 17/25 proyek, jadi tidak bisa dipakai sendirian. Aturannya (`getVaultProjects` di `src/lib/content/projects.ts`):

1. `is_featured: true`, **dan**
2. `link_demo` berupa URL publik `http(s)://` (bukan `#` / `#Private`), lalu
3. diurutkan dari `id` terbesar (terbaru), diambil **3** (`WORLD_VAULT_SIZE` di `content/world.ts`).

Hasil saat ini: *fihaa.my.id* (99), *Ayola* (24), *Ayola Mobile* (23). Alasannya: ruangan rahasia berisi karya yang bisa langsung dicoba pengunjung, dan jumlahnya kecil agar terasa istimewa. Untuk mengubah isinya cukup mengubah frontmatter atau angka batasnya, tanpa menyentuh kode.

## Struktur kode

```
content/world.ts                         # stasiun, teks UI (WORLD_COPY), WORLD_VAULT_SIZE
content/skills.ts                        # + SKILL_CATEGORY_LABELS
src/lib/content/types.ts                 # WorldStationId + 'secret', WorldCopy, WorldContent, WorldProject, …
src/lib/content/world.ts                 # getWorldStations, getWorldCopy, getWorldVaultSize
src/lib/content/world-content.ts         # server: getWorldContent() → data serializable untuk klien
src/lib/content/projects.ts              # + isPublicUrl, getVaultProjects
src/app/world/page.tsx                   # Server Component async; h1, tombol 2D, WorldCanvas
src/modules/world/
  config/layout.ts                       # posisi pulau, tampilan kamera, offset fokus panel
  store/world-store.ts                   # zustand: activeStation, hoveredStation
  hooks/use-world-palette.ts             # warna dari token CSS --color-world-*
  hooks/use-prefers-reduced-motion.ts
  components/world-canvas.tsx            # dynamic(ssr:false) scene + HUD
  components/world-scene.tsx             # <Canvas>, cahaya, Suspense, CameraRig, WorldProgress
  components/world-hud.tsx               # daftar stasiun (nav), panel, Esc, manajemen fokus
  components/world-progress.tsx          # useProgress (drei), tetap di chunk lazy
  components/scene/{floating-island,station-shape,station-object,guild-hall,camera-rig}.tsx
  components/panels/{station-body,project-list,skill-groups,journal-sections,contact-links}.tsx
```

## Keputusan teknis

| Topik | Keputusan | Verifikasi API |
|---|---|---|
| Kamera terbang | drei `<CameraControls>` (camera-controls 3.1.2): `setLookAt(…, enableTransition)` + `setFocalOffset` agar stasiun tidak tertutup panel (geser kanan di desktop, geser atas di HP). Zoom ×2 di layar sempit. | Tanda tangan dibaca dari `node_modules/camera-controls/dist/index.d.ts` (baris 765, 822) dan `@react-three/drei/core/CameraControls.d.ts` (drei 10.7.9). |
| Batas kontrol | rotate + dolly (6–110), `truckSpeed=0`, sudut polar 0,15–0,62π | `minDistance`, `maxDistance`, `minPolarAngle`, `maxPolarAngle`, `truckSpeed` di d.ts yang sama |
| Reduced motion | `prefers-reduced-motion: reduce` → kamera berpindah tanpa animasi | hook `useSyncExternalStore` + `matchMedia` |
| Loading | `next/dynamic` menampilkan "Loading the 3D world…"; `useProgress` menampilkan persentase saat model dimuat (aktif mulai Fase 8) | `@react-three/drei/core/Progress.d.ts` |
| Warna | Token `--color-world-*` di `globals.css` (abu-abu; aktif = `var(--color-accent)`), dibaca sekali lewat `getComputedStyle` | — |
| Data | `/world` tetap statis (`○`); konten dihitung saat build dan dikirim sebagai props. Komponen MDX proyek tidak ikut dikirim, hanya frontmatter. | `yarn build` |

## Aksesibilitas dan keyboard

- Urutan Tab: "Switch to 2D" → 5 tombol stasiun (`<nav aria-label="Places on the island">`, `aria-current` pada stasiun aktif).
- Enter/Space pada tombol stasiun: kamera terbang, panel `<section aria-labelledby>` terbuka, dan fokus pindah ke judul panel (`tabIndex=-1`).
- Esc: panel tertutup dan fokus kembali ke tombol stasiun sebelumnya. Diuji dengan Playwright: `focused: Quest Board → panel focus: world-panel-title → after esc focus: Quest Board, panel: false`.
- Fokus/hover pada tombol HTML ikut menyorot stasiun di 3D (`hoveredStation`).
- Canvas diberi `aria-hidden`; semua konten tersedia sebagai HTML di panel.
- **Keadaan kosong**: `stationHasContent()` memeriksa tiap stasiun dan menampilkan `emptyMessage` dari konten bila datanya kosong (mis. tidak ada proyek yang lolos kriteria vault). Bagian jurnal yang kosong disembunyikan per bagian.

## Hasil cek

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau (`/world` statis).
- Isolasi three (uji runtime `next start` + Playwright; chunk three kini `12gxcu78nhqaj.js`, 969.265 B / gzip 253.596 B, sebelumnya 930.159 B karena camera-controls masuk):

| Route | Chunk JS dimuat | Chunk three? |
|---|---:|---|
| `/` | 24 | tidak |
| `/2d` | 34 | tidak |
| `/2d/about` | 34 | tidak |
| `/2d/projects` | 34 | tidak |
| `/2d/contact` | 34 | tidak |
| `/world` | 20 | ya |

- Konsol `/world`: tidak ada error dari kode kita. Yang muncul: peringatan `THREE.Clock` deprecated dari internal R3F (sudah tercatat di Fase 4), peringatan preload CSS dari Next, dan `ERR_TUNNEL_CONNECTION_FAILED` dari skrip analitik eksternal yang diblokir sandbox.

## Pertanyaan Terbuka

1. Hidden Vault di bawah pulau guild masih sedikit terlihat dari tampilan awal (pulau gelap kecil di bawah). Saya biarkan sebagai petunjuk misterius; di Fase 9 bisa digelapkan/diberi kabut. Kalau ingin benar-benar tersembunyi (hanya muncul dari daftar), beri tahu saya.
2. Teks UI dunia memakai bahasa Inggris, mengikuti UI situs (mis. "Switch to 2D"). Bisa diganti di `content/world.ts` tanpa menyentuh komponen.

## Self-review Fase 7

1. Spesifikasi terpenuhi: 5 stasiun + kastel guild (abu-abu), kamera terbang + tombol kembali, panel dari `src/lib/content/*`, id `secret`, keadaan kosong, tombol 2D selalu terlihat, Tab/Enter/Esc, `useProgress`, tanpa efek.
2. Tidak ada teks konten di komponen 3D; semua dari `content/world.ts`/pembaca konten. Warna dari token `--color-world-*`.
3. `import type` dipakai; nama berkas kebab-case; tidak ada `any`; komentar kode berbahasa Inggris.
4. API camera-controls/drei dicek dari berkas `.d.ts` versi terpasang, bukan dari ingatan.
5. Ditemukan saat uji visual dan diperbaiki: stasiun tertutup panel (ditambah `setFocalOffset`), tampilan HP terlalu dekat (zoom ×2), dan tombol 2D sempat bukan elemen Tab pertama.
6. type-check, lint, build hijau; `/` dan `/2d/*` bebas chunk three (uji runtime).
7. Belum diukur: fps dan draw call. Pengukuran nyata dijadwalkan di Fase 10.
