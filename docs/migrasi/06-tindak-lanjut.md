# Tindak Lanjut Keputusan

Branch: `feat/tindak-lanjut-keputusan` (bercabang dari `feat/fase-5-token`).

## Keputusan pemilik (2026-10-12)

| # | Pertanyaan | Keputusan | Tindakan |
|---|---|---|---|
| 1 | Lockfile | Ganti ke Yarn saja | `package-lock.json` dihapus; `yarn.lock` satu-satunya lockfile. |
| 2 | Pengunjung yang kembali | Arahkan otomatis + tombol pindah 2D↔3D | Lihat di bawah. |
| 3 | Bahasa UI | Bahasa Inggris | Landing dan `/world` kini berbahasa Inggris (laporan tetap Bahasa Indonesia). |
| 4 | Arah visual | Bebas, menyesuaikan pulau nanti | Tidak ada perubahan sekarang; diputuskan saat greybox dunia 3D. |
| — | "Perbaiki juga bug lama" | Ya | Lihat di bawah. |

## Redirect otomatis & tombol pindah

- `/` (server) membaca cookie `world-mode`: `2d` → 307 ke `/2d`, `3d` → 307 ke `/world`. Tanpa cookie (termasuk crawler) → halaman pilihan. `/?choose` selalu menampilkan pilihan.
- **2D → 3D**: menu "Switch to 3D" di `MENU_ITEMS` (`src/common/constant/menu.tsx`), jadi muncul di sidebar desktop, menu mobile, dan header atas halaman blog/learn/novel (`HeaderTop.tsx` kini meneruskan `onClick` menu).
- **3D → 2D**: tombol "Switch to 2D" di `/world` (`src/modules/world/components/world-switch-link.tsx`).
- Kedua tombol menyimpan pilihan lewat `rememberWorldMode()` (Zustand + cookie), sehingga kunjungan berikutnya ke `/` mengikuti pilihan terakhir.
- Saran perangkat lemah tetap ada di halaman pilihan (hanya untuk kunjungan pertama).

Verifikasi Playwright (build produksi): kunjungan pertama → pilihan; pilih 3D → `/world`, cookie `3d`; buka `/` → `/world`; "Switch to 2D" → `/2d`, cookie `2d`; buka `/` → `/2d`; "Switch to 3D" dari sidebar `/2d/about`, menu mobile `/2d/projects`, dan header `/2d/blog` → `/world`; `/?choose` → pilihan. `curl -b world-mode=3d /` → `307 /world`.

## Bug lama yang diperbaiki

| Bug | Sebelum | Sesudah |
|---|---|---|
| Slug tidak ada di `/2d/projects/*`, `/2d/blog/*`, `/2d/learn/*`, `/2d/learn/*/*`, `/2d/novel/*`, `/2d/novel/*/*` | 200 dengan halaman kosong / "Not Found" / loading | 404 (`notFound()`) |
| Tombol Back di detail novel | ke `/2d/learn` | ke `/2d/novel` |
| `font-code` | merujuk `--firaCode-font` (tidak pernah ada) → font warisan | `--font-fira-code` → "Fira Code" (diverifikasi computed style) |
| Judul bab learn/novel | `font-[15px]` (salah ketik, tidak berefek) | `text-body-sm` (15px) |
| Peringatan `Image … quality "100"` | Next 16 hanya mengizinkan 75 | `images.qualities: [75, 100]` |

Perubahan tampilan yang disengaja: font username di dashboard (Fira Code) dan ukuran judul bab learn/novel (15px).

## Bukti

- 55 URL lama tetap berakhir 200 (`bukti/06-url-lama.tsv`).
- Slug tidak ada → 404; slug valid → 200.
- Isolasi bundle tetap: chunk three tidak dimuat di `/`, `/2d`, `/2d/about`, `/2d/projects`, `/2d/projects/ayola`, `/2d/blog`, walaupun menu 2D kini menautkan ke `/world`.
- `yarn type-check` hijau · `yarn lint` 0 error (13 warning lama) · `yarn build` hijau tanpa peringatan baru.

## Masih terbuka

- `id: 20` duplikat (`dcc` vs `persuratan-iain-parepare`): urutan mana yang benar?
- Endpoint `@vercel/postgres`, AOS → framer-motion, refactor aturan React Compiler, entitas Profil, blog/learn/novel di 3D, kategori skill, daftar `worldStation`, ambang perangkat lemah (lihat `00-ringkasan.md`).

## Self-review

1. Keempat keputusan dan permintaan bug lama tercakup; `id` duplikat tidak diubah karena butuh keputusan.
2. Klaim didukung Playwright, `curl`, dan keluaran build/lint/type-check.
3. Diff hanya menyentuh lockfile, landing/world-mode/world, menu 2D, dan file bug terkait.
4. Tidak ada `any`/rahasia baru; impor tipe via `import type`; tidak ada nilai gaya baru selain token yang ada.
5. type-check, lint, build hijau.
6. Tidak ada URL lama yang 404.
