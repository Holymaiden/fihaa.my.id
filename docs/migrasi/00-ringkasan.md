# Ringkasan Migrasi Portfolio 2D → 2D/3D

Tanggal: 2026-10-12 · Basis: `main` @ `a8a640a` · Tidak ada push ke `main`, merge PR, deploy, atau perubahan Vercel.

## Status per fase

| Fase | Status | Laporan | Inti |
|---|---|---|---|
| 0 Audit | ✅ selesai, gerbang lolos | `00-audit.md` | App Router; build hijau; type-check & lint merah dengan sebab jelas; `@vercel/postgres` hanya di 2 endpoint tanpa pemanggil. |
| 1 Stabilisasi | ✅ | `01-stabilisasi.md` | type-check/lint/build hijau; 8 PR dependensi diterapkan (3 keamanan); ESLint flat config; `react-scroll` dihapus. |
| 2 Konten | ✅ | `02-konten.md` | `content/` (proyek MDX, skill, pengalaman, kontak) + `src/lib/content/*`; HTML 2D identik. |
| 3 Routing & landing | ✅ | `03-routing.md` | 2D di `/2d`; redirect 308; landing "Pilih Dunia" + cookie/Zustand + saran perangkat; 55/55 URL lama → 200. |
| 4 R3F | ✅ | `04-r3f.md` | three 0.186 / fiber 9.8 / drei 10.7 di `/world` (dynamic, `ssr:false`); three tidak dimuat di `/` maupun `/2d/*` (terbukti). |
| 5 Token | ✅ | `05-token.md` | `tailwind.config.ts` → `@theme`; nilai hardcoded → token; 0 selisih computed style di 60 snapshot. |

| Tindak lanjut | ✅ | `06-tindak-lanjut.md` | Yarn saja; `/` redirect otomatis + tombol Switch 2D/3D; UI Inggris; bug lama (404, font, back button, image quality) diperbaiki. |

| Keputusan lanjutan | ✅ | `07-keputusan-lanjutan.md` | `@vercel/postgres` & AOS dihapus (framer-motion); 13 peringatan React Compiler diperbaiki; bug hidrasi nama profil & `<main>` bersarang; kategori skill + daftar stasiun 3D. |

Hasil akhir di `refactor/keputusan-lanjutan`: `yarn type-check` hijau, `yarn lint` 0 masalah, `yarn build` hijau.

## Branch dan commit

Branch bertumpuk (setiap fase bercabang dari fase sebelumnya), semua sudah di-push:

| Branch | Commit di atas `main` (non-merge) |
|---|---|
| `chore/fase-1-stabilisasi` | `6d11135` audit · `5750e6c` hapus react-scroll · `428618a` tsconfig ES2017 · `844aa74` next 16.4.0 · `87fc219` axios+postcss · `65da380` react 19.3 dkk. · `82e9537` perbaikan lint · `50f6f7e` flat config · `6ef28bc` laporan · `d348ce8` komentar → Inggris |
| `refactor/fase-2-konten` | `102d389` skema · `de2c991` proyek → `content/` · `27f96d1` skill · `7fb7467` pengalaman · `a40ca66` kontak · `cfbf2cc` laporan · `34b4d11` komentar |
| `feat/fase-3-routing` | `819f81f` helper rute · `281a776` pindah ke `/2d` + redirect · `e25d08f` landing · `40997f1` sitemap/robots · `762284d` laporan · `f405ec9` komentar |
| `feat/fase-4-r3f` | `513c8df` dependensi R3F · `028ffcd` scene `/world` · `50e83a4` komentar · `81a203f` laporan |
| `feat/fase-5-token` | `879c86d` `@theme` · `bb07a28` warna komponen → token · `7311f9c` kelas arbitrer → token · `33069a8` laporan · ringkasan |
| `feat/tindak-lanjut-keputusan` | `32f732b` hapus package-lock · `029e95d` redirect + tombol Switch + UI Inggris · `f4b2868` bug lama · `7f2a186` id duplikat · laporan |
| `refactor/keputusan-lanjutan` | `6a7cf9b` hapus postgres · `9334e09` AOS → framer-motion · `39425ae` refactor lint · `0e254d1` bug hidrasi & `<main>` · `c5f90da` kategori skill & stasiun · laporan |

Branch sesi `claude/clever-albattani-e7tn9x` di-fast-forward ke ujung `refactor/keputusan-lanjutan` (isi sama). Atas permintaan pemilik, seluruh commit digabung dalam **satu PR** dari branch sesi ke `main`.

Catatan: atas permintaan di tengah pekerjaan, komentar kode yang saya tambahkan ditulis ulang ke bahasa Inggris yang ringkas. Perubahan dibuat di branch fase asal lalu di-merge maju (commit merge), tanpa rewrite history.

Saran urutan PR: buka satu PR per branch dengan base branch fase sebelumnya (fase-1 → `main`, fase-2 → fase-1, dst.), atau satu PR dari `feat/fase-5-token` ke `main`.

## Pertanyaan Terbuka yang butuh keputusan Anda

> **Sudah diputuskan (2026-10-12)**: no. 1 (pakai Yarn), 11 (redirect otomatis + tombol Switch), 13 (UI bahasa Inggris), 16 (arah visual menyesuaikan pulau), 17 (bug lama diperbaiki), 10 (`id` duplikat diperbaiki: persuratan → 19), 2 (postgres dihapus), 3 (AOS → framer-motion), 5 (lint React Compiler diperbaiki), 7 (blog/learn/novel tidak di 3D), 8 & 9 (kategori skill & daftar stasiun, draf). Detail di `07-keputusan-lanjutan.md`. **Masih terbuka: no. 4 (tutup PR Dependabot usang), 6 (entitas Profil), 12 (ambang perangkat lemah), 14 (SEO landing / `/world` di sitemap), 15 (novel dipertahankan?).** Keputusan sebelumnya: `06-tindak-lanjut.md`.

**Infrastruktur & dependensi**
1. Lockfile: hapus `package-lock.json` yang basi dan resmi pakai Yarn? (konfirmasi pengaturan Vercel)
2. Endpoint `@vercel/postgres` (`/api/views`, `/api/table/views`) tidak dipakai: hapus, atau migrasi ke Neon untuk fitur view-count?
3. Ganti AOS dengan framer-motion saja?
4. Tutup PR Dependabot usang Holymaiden/fihaa.my.id#66, Holymaiden/fihaa.my.id#51, Holymaiden/fihaa.my.id#48. PR Depfu lain sudah tercakup di Fase 1.
5. Aturan React Compiler (`set-state-in-effect`, `static-components`) diset `warn`; jadwalkan refactor 13 lokasi?

**Konten**
6. Perlu entitas **Profil** (nama, bio, lokasi, status) di `content/` untuk dunia 3D?
7. Apakah blog/learn/novel tampil di dunia 3D? Jika ya, pindahkan ke `content/`.
8. Kategori/level skill untuk pengelompokan di 3D?
9. Daftar `worldStation` (stasiun dunia 3D).
10. `id: 20` duplikat (`dcc` vs `persuratan-iain-parepare`): mana yang lebih dulu?

**Routing & landing**
11. Pengunjung yang kembali: cukup ajakan "Lanjutkan" (sekarang), atau redirect otomatis berdasarkan cookie?
12. Ambang perangkat lemah (memori < 4 GB, < 4 core, lebar < 768 px).
13. Bahasa UI: landing pakai Bahasa Indonesia, 2D berbahasa Inggris, tanpa i18n. Pakai satu bahasa, atau tambah i18n?
14. SEO: canonical beranda 2D kini `/2d`; landing `/` minim teks. Tambah ringkasan profil di landing? Masukkan `/world` ke sitemap nanti?
15. Novel: route hidup tapi menu dinonaktifkan. Tetap dipertahankan?

**Gaya**
16. Pilih arah visual: "Langit Fajar", "Senja Kristal", atau "Netral + aksen per pulau" (detail di `05-token.md`).
17. Bug lama `font-code` (Fira Code tidak pernah tampil) dan `font-[15px]` (kemungkinan salah ketik): perbaiki? Keduanya akan mengubah tampilan sedikit.

## Usulan langkah berikutnya

1. **Keputusan cepat**: no. 1, 2, 11, 13, 16 di atas (memblokir desain berikutnya).
2. **Desain landing**: wireframe "Pilih Dunia" sesuai arah visual terpilih; tambahkan teks profil singkat untuk SEO.
3. **Palet & token semantik**: tambahkan `surface`, `text-muted`, `accent`, `station-*` di `@theme`; petakan 2D; baca token yang sama di R3F.
4. **Greybox dunia 3D**: pulau-pulau berbentuk primitif (tanpa aset) untuk tiap `worldStation`, kamera & kontrol (orbit/klik-untuk-pindah), panel konten dari `src/lib/content`, fallback ke 2D; ukur performa di perangkat lemah.
5. **Pencarian aset**: model low-poly bergaya anime (lisensi CC0/komersial jelas), kompres dengan glTF + Draco/Meshopt, anggaran ukuran per pulau.
6. Bersih-bersih teknis: hapus `package-lock.json`, AOS, endpoint postgres; perbaiki 404 untuk slug proyek/blog yang tidak ada (`notFound()`); atur `images.qualities` di `next.config.mjs`.

## Self-review akhir

1. Semua fase 0–5 dikerjakan; bagian yang dilewati (penggantian library besar, pemilihan palet, field ambigu) dicatat beserta alasannya.
2. Setiap klaim di laporan punya bukti: path:baris, keluaran build/lint/type-check, diff HTML, 55 cek URL (`bukti/03-url-lama.tsv`), analisis bundle (`bukti/04-bundle-runtime.txt`), dan 60 snapshot computed style.
3. `git diff main..feat/fase-5-token`: 146 file; tidak ada `.env`, rahasia, atau `AGENTS.md` (file yang dibuat otomatis oleh `next dev` sudah dihapus). Satu-satunya `any` di diff adalah kode lama di `mdx.ts` yang hanya bergeser indentasi.
4. Tidak ada `any` baru; impor tipe memakai `import type` (dijaga ESLint `consistent-type-imports`); nilai gaya baru hanya lewat token.
5. type-check, lint, build hijau di setiap branch (type-check perlu `.next` bersih setelah pindah branch, karena tipe basi di `.next/types`).
6. Tidak ada URL lama yang menjadi 404: 55/55 berakhir 200 lewat redirect 308.
