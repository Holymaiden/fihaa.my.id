# Fase 3 — Routing & Landing

Branch: `feat/fase-3-routing` (bercabang dari `refactor/fase-2-konten`).

## Struktur route baru

| Route | Isi | Render |
|---|---|---|
| `/` | Landing "Pilih Dunia" (placeholder) | dinamis (membaca cookie) |
| `/2d`, `/2d/about`, `/2d/contact`, `/2d/dashboard`, `/2d/projects[/slug]`, `/2d/blog[/slug]`, `/2d/learn[/slug[/content]]`, `/2d/novel[/slug[/content]]` | Portfolio 2D (dipindah dari root, `git mv`) | sama seperti sebelumnya |
| `/world` | Placeholder (diisi di Fase 4) | statis |
| `/api/*`, `/robots.txt`, `/sitemap.xml`, ikon, `/images/*` | tidak berubah | — |

Perubahan pendukung:
- `src/lib/routes.ts`: `SITE_URL`, `ROUTE_2D`, `ROUTE_WORLD`, `to2d()`, `stripRoute2d()` — satu tempat untuk prefix.
- Root layout (`src/app/layout.tsx`) kini hanya `<html>/<body>`, font, `Providers` (next-themes), analytics, AdSense. Chrome 2D (skip link, sidebar/header `Layout`, `ProgressBar`, `ContactWidget`, inisialisasi AOS + CSS AOS) dipindah ke `src/app/2d/layout.tsx` (+ `src/app/2d/aos-init.tsx`). Tujuannya agar `/` dan `/world` tidak memuat chrome 2D.
- `Layout` (`src/common/components/layouts/index.tsx`) menormalkan pathname dengan `stripRoute2d()` sehingga logika header-atas vs sidebar (blog/novel/learn) tetap sama.
- 20+ tautan internal (`href`, `router.push`, `BackButton url`, `MENU_ITEMS`) diganti `to2d(...)` sehingga navigasi di dalam 2D tidak melewati redirect.
- `metadataBase: new URL(SITE_URL)` ditambahkan → peringatan build hilang dan `og:image`/`twitter:image` kini absolut `https://fihaa.my.id/images/fihaa.png` (sebelumnya `http://localhost:3000/...` di build lokal).
- Canonical/OG beranda 2D: `https://fihaa.my.id` → `https://fihaa.my.id/2d`. Landing `/` memakai canonical `https://fihaa.my.id`.
- `not-found.tsx` global membungkus kontennya dengan layout 2D (tampilan 404 sama seperti sebelumnya) dan tautannya ke `/2d`, `/2d/blog`, `/2d/projects`.

## Redirect permanen (`next.config.mjs`)

```js
LEGACY_2D_SECTIONS = ['about','blog','contact','dashboard','learn','novel','projects']
// → { source: '/<section>/:path*', destination: '/2d/<section>/:path*', permanent: true }
```

`:path*` mencakup nol segmen (`/about`) maupun bertingkat (`/learn/react-2024/0-why-react`). Next mengirim **308** dan meneruskan query string. `/` tidak di-redirect (menjadi landing).

### Verifikasi: tidak ada URL lama yang 404

Build produksi + `next start`, lalu `curl` setiap URL lama dari daftar Fase 0 (55 URL: 11 halaman/varian query, 25 proyek, 3+1 blog, 1+3 learn, 1+1 novel, 9 aset/metadata/API). Hasil lengkap: `docs/migrasi/bukti/03-url-lama.tsv`. Ringkas:

| Kelompok | Respons pertama | Akhir (setelah redirect) |
|---|---|---|
| `/` | 200 (landing) | 200 |
| `/about`, `/contact`, `/dashboard`, `/projects`, `/blog`, `/learn`, `/novel` | 308 → `/2d/<x>` | 200, judul sama dengan halaman lama |
| `/about/` (garis miring akhir) | 308 → `/about` → 308 → `/2d/about` | 200 (2 hop) |
| `/blog?page=1&search=`, `/novel?page=1`, `/blog/1-next-js-14-membangun-masa?id=1` | 308, query dipertahankan | 200 |
| 25 × `/projects/<slug>` | 308 | 200, `<title>` = judul proyek |
| 3 × `/blog/<slug>`, `/learn/react-2024`, 3 × `/learn/react-2024/<bab>`, `/novel/infinite-mage`, `/novel/infinite-mage/1-Temui-Keajaiban-` | 308 | 200 |
| `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, `/icon.ico`, `/apple-icon.png`, `/manifest.json`, `/ads.txt`, `/images/fihaa.png`, `/api/learn?slug=react-2024` | 200 (tanpa redirect) | 200 |

**55/55 berakhir 200.** `/tidak-ada` dan `/2d/tidak-ada` → 404 dengan tampilan 2D (diverifikasi Playwright: `#sidebar` dan nav tampil).

Catatan: slug proyek/blog yang tidak ada sudah mengembalikan 200 sejak sebelum migrasi (lihat 01-stabilisasi). Tidak diubah.

### Verifikasi: tampilan 2D tidak berubah

HTML `/2d/<x>` dibandingkan dengan HTML `/<x>` dari build Fase 2 (skrip menghapus `<script>`/`<link>`, menormalkan hash aset dan prefix `/2d` di `href`). Selisih DOM yang terlihat:

| Halaman | Selisih |
|---|---|
| `/2d/about`, `/2d/contact`, `/2d/projects`, `/2d/dashboard`, `/2d/blog` | 0 |
| `/2d` (beranda) | `og:url` → `/2d` (disengaja); `og:image`/`twitter:image` absolut (metadataBase) |
| `/2d/projects/<slug>` | hanya `og:image`/`twitter:image` absolut |

Yang berubah di payload RSC hanyalah pembagian chunk (akibat layout 2D dipisah). Playwright: `/2d/blog` memakai header atas (tanpa `#sidebar`), `/2d/about` memakai sidebar, menu aktif "About" pada `/2d/about`.

## Landing `/` (placeholder fungsional)

`src/app/page.tsx` (server, baca cookie) → `src/modules/landing/components/world-picker.tsx` (client). Dua kartu: **Dunia 2D** → `/2d`, **Dunia 3D** → `/world`. Hanya kelas Tailwind/komponen `Card` yang sudah ada; tidak ada palet/font baru.

### Preferensi mode

- `src/lib/world-mode/world-mode-store.ts`: store **Zustand** (`mode`, `setMode`). `setMode` menulis cookie `world-mode` (`2d`/`3d`, `path=/`, 1 tahun, `SameSite=Lax`).
- Cookie yang sudah ada (`novelAuth` via `next-client-cookies`) tidak cocok dipakai ulang (khusus gerbang novel, kedaluwarsa 1 hari), jadi dibuat cookie terpisah. Server membaca cookie lewat `cookies()` dari `next/headers` (tanpa dependensi baru).
- **Tanpa memaksa**: pengunjung yang kembali tetap melihat landing, dengan teks "Terakhir kali Anda memilih Dunia X. Lanjutkan" dan label "Disarankan" pada pilihan itu. Tidak ada redirect otomatis.
- Pilihan disimpan hanya saat memilih di landing (bukan saat membuka `/2d` langsung).

### Saran perangkat lemah

`src/lib/world-mode/device-hint.ts` (`useSyncExternalStore`, hanya di klien): dianggap lemah bila `navigator.deviceMemory < 4` **atau** `hardwareConcurrency < 4` **atau** `innerWidth < 768`. Efeknya hanya teks saran + label "Disarankan" pada 2D; kedua pilihan tetap bisa diklik. Ambang adalah nilai sementara (lihat Pertanyaan Terbuka).

Playwright (Chromium headless):
- Desktop 1280×800, kunjungan pertama: dua pilihan, tanpa saran.
- Klik "Dunia 2D" → URL `/2d`, cookie `world-mode=2d`.
- Kembali ke `/`: tampil "Terakhir kali Anda memilih Dunia 2D. Lanjutkan" + "Disarankan" pada 2D.
- Ponsel 390×844, kunjungan pertama: tampil saran "Perangkat ini tampaknya terbatas, Dunia 2D disarankan…".

## SEO

- `sitemap.ts`: `https://fihaa.my.id` (landing) + `/2d`, `/2d/dashboard`, `/2d/projects`, `/2d/blog`, `/2d/learn`, `/2d/novel`, `/2d/about`, `/2d/contact` (prioritas/frekuensi sama seperti sebelumnya). `/world` belum dimasukkan (masih placeholder).
- `robots.ts`: tambah disallow `/2d/dashboard/` (padanan `/dashboard/` lama, yang tetap ada). Aturan bot AI tidak diubah.

## Hasil cek

`yarn type-check` hijau · `yarn lint` 0 error (13 warning lama) · `yarn build` hijau tanpa peringatan `metadataBase`.

Catatan teknis: `tsconfig.json` meng-include `.next/types/**`; setelah memindah route, `type-check` gagal sampai `.next` lama dihapus/di-build ulang (tipe basi). Ini perilaku bawaan Next, bukan error kode.

## Pertanyaan Terbuka (Fase 3)

1. **Redirect otomatis** untuk pengunjung yang kembali? Saat ini hanya ajakan "Lanjutkan". Alternatif: redirect server-side dari `/` berdasarkan cookie + tautan "Ganti dunia" di 2D/3D.
2. **Ambang perangkat lemah** (memori < 4 GB, < 4 core, lebar < 768 px) perlu disetujui, khususnya apakah layar kecil saja cukup untuk menyarankan 2D.
3. **Bahasa** landing: ditulis Bahasa Indonesia sesuai istilah "Pilih Dunia", sedangkan UI 2D berbahasa Inggris dan `<html lang="en">`.
4. **`/world` di sitemap** setelah dunia 3D siap? Konten canvas tidak terindeks mesin pencari.
5. **SEO beranda**: canonical beranda 2D kini `/2d`; landing `/` hanya berisi pilihan. Pertimbangkan teks ringkas profil di landing agar `/` tetap relevan untuk pencarian nama.
6. Data karier "Freelance" berisi tautan absolut `https://fihaa.my.id/projects` (`content/experience.ts`) — tetap berfungsi via redirect; ubah ke `/2d/projects`?

## Self-review Fase 3

1. Langkah 1–6 tercakup; perilaku "tanpa memaksa" diinterpretasikan sebagai ajakan, dicatat di Pertanyaan Terbuka.
2. Klaim didukung keluaran `curl` (55 URL), diff HTML, dan Playwright.
3. Diperbaiki saat review: commit sempat tercampur (rename dari `git mv` ikut ke commit helper); riwayat disusun ulang sebelum push sehingga tiap commit konsisten.
4. Tidak ada `any`/rahasia baru; impor tipe via `import type`; landing hanya memakai kelas Tailwind & komponen yang ada (nilai ambang perangkat adalah logika, bukan gaya).
5. type-check, lint, build hijau.
6. Semua 55 URL lama berakhir 200; tidak ditemukan URL lama yang 404.
