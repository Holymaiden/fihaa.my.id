# Fase 5 — Pondasi Design Token

Branch: `feat/fase-5-token` (bercabang dari `feat/fase-4-r3f`).

## Ringkasan

- `tailwind.config.ts` + `@config` **dihapus**; seluruh tema kini CSS-first di `src/common/styles/globals.css` (Tailwind 4 `@theme`).
- Nilai hardcoded dari audit (§5) diganti token, kecuali yang dicatat di bawah.
- **Tidak ada palet, font, atau gaya baru.** Semua token bernilai persis sama dengan nilai lama.
- Bukti: computed style seluruh elemen di 15 halaman × 2 tema × 2 viewport (60 snapshot) **identik** dengan sebelum perubahan (0 selisih).

## Struktur token (`globals.css`)

```css
@import 'tailwindcss' source(none);
@source '../../**/*.{js,ts,jsx,tsx,mdx}';           /* = content glob lama: ./src/** */
@custom-variant dark (&:where(.dark, .dark *));     /* = darkMode: 'class' */

@theme inline { --font-sans, --font-sora, --font-code, --font-emoji }
@theme static { warna, ukuran teks, line-height, container, spacing, radius, animasi + @keyframes }
@utility bg-gradient-radial / bg-gradient-conic      /* = backgroundImage lama */
```

- `@theme inline` untuk font: variabel `next/font` (`--jakartaSans-font`, `--soraSans-font`) dipasang di `<body>`, jadi harus di-inline ke utilitas, bukan di-resolve di `:root`. Versi pertama tanpa `inline` membuat `font-sora` jatuh ke font default (terdeteksi oleh perbandingan computed style: 8.106 selisih `font-family`), lalu diperbaiki.
- `@theme static` agar token yang hanya dibaca lewat `var()` di komponen (skeleton, toggle tema) tetap ikut ter-output.

| Kelompok | Token | Nilai | Menggantikan |
|---|---|---|---|
| Warna dasar | `--color-dark`, `--color-light`, `--color-darkText` | `#121212`, `#fafafa`, `#e4e6eb` | `tailwind.config.ts` colors + duplikat `:root` |
| Aksen | `--color-accent`, `--color-accent-glow` | `#15b8a6`, `rgb(45 212 191 / 15%)` | bar NProgress, gradien `body` |
| Komponen | `--color-loader`, `--color-hairline`, `--color-panel-dark` | `#36d7b7`, `#ffffff1a`, `#1b1b1b80` | `text-[#36d7b7]`, `border-[#ffffff1a]` ×2, `dark:bg-[#1b1b1b80]` |
| Skeleton | `--color-skeleton-{base,highlight}-{light,dark}` | `#ebebeb #f5f5f5 #202020 #2e2e2e` | `SkeletonLoader.tsx` |
| Toggle tema | `--color-toggle-{sun,day-start,day-end,night-start,night-end}` + `--color-white` (bawaan) | `#f7f7e7 #93d4cc #c7dfc3 #173754 #388296 #fff` | `ThemeToggleButton.tsx` |
| Ukuran teks | `--text-2xs` 12px, `--text-caption` 13px, `--text-meta` 14px, `--text-body-sm` 15px, `--text-subheading` 18px | — | `text-[12px]`, `text-[13px]` ×8, `text-[14px]` ×5, `text-[15px]` ×9 + `text-[.9375rem]`, `text-[18px]` |
| Line-height | `--leading-prose` | 1.8 | `leading-[1.8]` ×7 |
| Dimensi | `--container-content` 1024px, `--container-footer` 790px, `--container-card` 326px, `--spacing-hero` 400px | — | `max-w-[1024px]`, `max-w-[790px]`, `min-w-[326px]` ×3, `h-[400px]` ×4 |
| Radius | `--radius-scrollbar` | 3px | `rounded-[3px]` (scrollbar) |
| Font/animasi | `--font-*`, `--animate-*` + `@keyframes wave/flying/badge/loop` | sama | `tailwind.config.ts` |
| Fade Skills | memakai `var(--color-dark)` | — | `#121212` ×2 di `Skills.tsx` |

Catatan teknis: utilitas `text-body-sm` dkk. hanya mengeset `font-size` (tidak ada token `--text-*--line-height`), sama seperti `text-[15px]` sebelumnya — diverifikasi di CSS hasil build.

## Bukti tidak ada perubahan tampilan

Metode (Playwright, build produksi): untuk setiap elemen di `<body>` dicatat 23 properti computed (`color`, `background-color`, `background-image`, `font-family`, `font-size`, `line-height`, `font-weight`, warna/tebal border, `width`, `max-width`, `min-width`, `height`, `fill`, `stop-color`, `flood-color`, animasi, `padding-top`, `letter-spacing`, `box-shadow`, `opacity`).

- Halaman: `/`, `/2d`, `/2d/about`, `/2d/projects`, `/2d/projects/ayola`, `/2d/blog`, `/2d/blog/1-next-js-14-membangun-masa`, `/2d/learn`, `/2d/learn/react-2024`, `/2d/learn/react-2024/0-why-react`, `/2d/contact`, `/2d/dashboard`, `/2d/novel`, `/world`, `/2d/tidak-ada`.
- Tema gelap & terang (berbeda 724 baris di `/2d/about`, membuktikan tema benar diterapkan), viewport 1280 dan 390.
- `Math.random` di-seed agar urutan skill yang diacak deterministik; dua baseline berturut-turut → 0 selisih (noise nol).
- **Hasil: 0 selisih** antara sebelum (`feat/fase-4-r3f`) dan sesudah.
- Skeleton (hanya tampil saat memuat) diuji terpisah dengan menahan `/api/novel`: `background-color` tetap `rgb(32, 32, 32)` (= `#202020`).

## Tidak diganti (dan alasannya)

| Nilai | Lokasi | Alasan |
|---|---|---|
| `#36d7b7` di `<HashLoader color>` | `Loading.tsx` | `react-spinners` mem-parse warna sebagai hex/rgb (`calculateRgba`), `var()` merusak animasi. Diberi komentar bahwa nilainya sama dengan `--color-loader`. |
| `theme-color #000000` | `layout.tsx` (meta) | Nilai meta untuk browser, bukan CSS; tidak bisa membaca variabel CSS. |
| `rgb(8 0 0 / 0%)` | gradien `body` | Ujung transparan gradien. |
| `--font-code: var(--firaCode-font)` | `globals.css` | **Bug lama dipertahankan**: `next/font` mendefinisikan `--font-fira-code`, jadi `font-code` (dipakai di `Contributions.tsx:44`) tidak pernah tampil sebagai Fira Code. Memperbaikinya mengubah tampilan → menunggu keputusan. |
| Satu kali pakai: `w-[10px]`, `h-[10px]`, `w-[12px]`, `h-[12px]`, `gap-[3px]`, `my-[2px]`, `h-[164px]`, `h-[120px]`, `pt-[45vh]`, `min-h-[60vh]`, `border-l-[5px]`, `w-[-webkit-fill-available]`, `z-[2]`, `z-[999]`, `scale-[1.02]`, `scale-[101%]`, `scale-[102%]` | berbagai | Nilai tata letak lokal satu kali pakai; token tidak menambah konsistensi. |
| `font-[15px]` ×2 | `ChapterCard.tsx` (learn & novel) | Kelas tidak valid (ukuran di utilitas `font-*`); tidak berefek. Dibiarkan agar tampilan tidak berubah; sebaiknya dihapus. |
| Palet bawaan Tailwind (`neutral-*`, `gray-*`, `blue-*`, `teal-*`) dan warna merek ikon (`stacks.tsx`, `CONTACT_PRESENTATION`) | seluruh 2D | Sudah berupa token Tailwind. Lapisan token semantik (mis. `--color-surface`, `--color-text-muted`) sebaiknya dibuat bersamaan dengan keputusan palet. |
| Warna di dunia 3D | `world-scene.tsx` | Memakai `meshNormalMaterial` (tanpa warna). |

## Usulan arah visual (BELUM diterapkan — butuh keputusan)

Konteks: dunia 3D bertema pulau melayang ala anime/petualangan (guild). 2D saat ini: gelap-netral, aksen teal, Plus Jakarta Sans + Sora.

1. **"Langit Fajar" (hangat, ilustratif)** — langit gradien biru-muda ke peach, panel UI bergaya perkamen krem, aksen amber/emas untuk quest & tombol, teal yang ada dipertahankan sebagai warna "sihir". Font judul rounded yang ramah (keluarga rounded sans), body tetap Plus Jakarta Sans.
   *Alasan:* paling dekat dengan nuansa petualangan anime yang cerah; papan quest/perkamen cocok dengan metafora guild; teal lama tetap punya peran sehingga 2D dan 3D terasa satu keluarga.
2. **"Senja Kristal" (gelap, magis)** — dominan indigo/ungu tua dengan kristal bercahaya cyan-teal, UI kaca gelap (mirip `--color-panel-dark` yang sudah ada), aksen magenta tipis. Font tetap Sora untuk judul.
   *Alasan:* selaras dengan default tema gelap situs saat ini dan aksen teal; efek glow mudah dibuat di R3F (emissive + bloom) sehingga terlihat "wah" tanpa aset tekstur berat; transisi 2D↔3D paling mulus.
3. **"Netral + aksen per pulau" (konservatif)** — 2D tetap netral seperti sekarang; tiap pulau/stasiun 3D punya satu aksen sendiri (mis. proyek = hijau, skill = biru, pengalaman = emas), dipetakan ke token `--color-station-*` dan field `worldStation`.
   *Alasan:* perubahan brand paling kecil, mudah diterapkan bertahap, dan aksen per stasiun membantu navigasi di dunia 3D; risiko rendah bila desain akhir belum pasti.

Apa pun pilihannya, langkah berikutnya: tambah lapisan token **semantik** (`surface`, `text-muted`, `accent`, `station-*`) di `@theme`, lalu petakan 2D ke token itu, dan baca nilai yang sama di R3F (mis. lewat `getComputedStyle(document.documentElement)` saat inisialisasi scene).

## Hasil cek

`yarn type-check` hijau · `yarn lint` 0 error (13 warning lama) · `yarn build` hijau.

## Self-review Fase 5

1. Langkah 1–3 tercakup; pengecualian dicatat dengan alasan.
2. Klaim "tanpa perubahan tampilan" dibuktikan dengan perbandingan computed style (0 selisih) + uji skeleton.
3. Diperbaiki saat review: (a) token font tanpa `inline` sempat mengubah font — terdeteksi & diperbaiki; (b) `var()` di `HashLoader` akan merusak animasi — dikembalikan ke hex; (c) commit sempat tercampur karena `git add` gagal — disusun ulang sebelum push.
4. Tidak ada `any`, rahasia, palet/font baru; komentar kode dalam bahasa Inggris.
5. type-check, lint, build hijau.
6. Tidak ada perubahan routing.
