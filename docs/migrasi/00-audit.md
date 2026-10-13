# Fase 0 — Audit (read-only)

Tanggal audit: 2026-10-12 · Basis: `main` @ `a8a640a` · Lingkungan: Node 22.22.0, Yarn 1.22.22.

Konvensi laporan: **FAKTA** = terlihat di kode/keluaran perintah (dengan path:baris). **DUGAAN** = interpretasi yang belum terverifikasi.

---

## 1. Struktur proyek

**FAKTA**
- **App Router** (`src/app/`), tidak ada direktori `pages/`. Tidak ada `middleware.ts`/`proxy.ts`.
- Root layout `src/app/layout.tsx` membungkus SEMUA route dengan `Providers` (next-themes + AOS), `AnalyticsProvider`, `Layout` (sidebar/header), `ProgressBar`, `ContactWidget`, dan `GoogleAdsense` (`layout.tsx:104-114`). Artinya layout 2D saat ini juga akan membungkus `/` dan `/world` bila tidak dipisah.
- `Layout` (`src/common/components/layouts/index.tsx:28-33`) memilih header atas vs sidebar berdasarkan `pathname.split('/')[1]` (`novel`, `blog`, `/learn/`). Logika ini bergantung pada posisi segmen pertama URL → **harus disesuaikan saat pindah ke `/2d/...`**.
- Ada dua elemen `<main>` bersarang (`layout.tsx:108` dan `layouts/index.tsx:47,52`).
- Layout khusus: `src/app/novel/layout.tsx` (CookiesProvider + gerbang kunci novel).
- Struktur modul: `src/modules/<fitur>/components/*` (about, blog, contact, dashboard, home, learn, novel, projects); elemen bersama di `src/common/components/{elements,layouts,sidebar,skeleton,seo,providers}`; data di `src/common/constant`; tipe di `src/common/types`; MDX loader di `src/common/libs/mdx.ts`.
- Penamaan file komponen yang ada: **PascalCase** (mis. `ProjectCard.tsx`), hooks camelCase. ESLint `unicorn/filename-case` mengizinkan kebab/Pascal/camel (`.eslintrc.json:12-21`). File baru dari pekerjaan ini akan kebab-case sesuai instruksi.

**Route (keluaran `next build`)**

| Route | Jenis | Sumber |
|---|---|---|
| `/` | statis | `src/app/page.tsx` → `modules/home` |
| `/about` | statis | `modules/about` |
| `/contact` | statis | `modules/contact` |
| `/dashboard` | statis (data via SWR client) | `modules/dashboard` |
| `/projects`, `/projects/[slug]` | statis / dinamis | MDX `src/contents/projects` |
| `/blog`, `/blog/[slug]` | statis / dinamis | MDX `src/contents/blogs` |
| `/learn`, `/learn/[slug]`, `/learn/[slug]/[content]` | statis / dinamis | `constant/learn.ts` + MDX `src/contents/learns` |
| `/novel`, `/novel/[slug]`, `/novel/[slug]/[content]` | dinamis | `constant/novel.ts` + MDX `src/contents/novels` |
| `/api/contact`, `/api/content`, `/api/github`, `/api/learn`, `/api/novel`, `/api/views`, `/api/table/views` | route handler | `src/app/api/**` |
| `/robots.txt`, `/sitemap.xml`, `/icon.ico`, `/apple-icon.png` | metadata | `src/app/*` |

## 2. Sumber konten

| Data | Lokasi (FAKTA) | Cara baca |
|---|---|---|
| Proyek (25) | `src/contents/projects/*.mdx` (frontmatter: `id,title,slug,is_featured,description,cover_url,stacks,link_demo,link_github`) | `loadMdxFiles`/`loadMdxFile` di `src/common/libs/mdx.ts:22,97` (fs + `next-mdx-remote/rsc`) |
| Blog (3) | `src/contents/blogs/*.mdx` | sama |
| Learn | daftar kursus `src/common/constant/learn.ts`, bab di `src/contents/learns/<slug>/*.mdx` | sama + `/api/learn` (hitung file) |
| Novel | `src/common/constant/novel.ts` + `src/contents/novels/<slug>/*.mdx` | `loadMdxNovelFile(s)` |
| Skill | `src/common/constant/stacks.tsx` (map nama → elemen ikon JSX + kelas warna) | impor langsung (`Skills.tsx:11`, `ProjectCard.tsx:8`, `ProjectDetail.tsx:3`) |
| Pengalaman/karier | `src/common/constant/careers.ts` | impor langsung (`CareerList.tsx:7`) |
| Pendidikan | `src/common/constant/education.ts` | impor langsung |
| Organisasi | `src/common/constant/organization.ts` | impor langsung |
| Cerita "About" | `src/common/constant/about.ts` (string HTML, dirender via `dangerouslySetInnerHTML` di `Story.tsx:7`) | impor langsung |
| Kontak/sosial | `SOCIAL_MEDIA` di `src/common/constant/menu.tsx:97+` (berisi elemen ikon JSX + className) | impor langsung (`ContactWidget.tsx`, `SocialMediaList.tsx`) |
| Teks beranda | hardcoded di `modules/home/components/Introduction.tsx`, `Services.tsx` | — |

Temuan data (FAKTA):
- `id: 20` dipakai dua kali (`dcc.mdx` dan `persuratan-iain-parepare.mdx`) → urutan sort tidak deterministik untuk keduanya.
- Semua `slug` frontmatter proyek sama dengan nama file (diverifikasi skrip). Kartu memakai `frontMatter.slug` (`ProjectCard.tsx:14`), halaman detail memakai nama file (`mdx.ts:110`).
- Blog: `slug` di frontmatter (mis. `1-next.js-14-...`) **berbeda** dari nama file; tautan memakai nama file (`BlogCard.tsx:28`).
- `src/common/constant/project.ts` (`PROJECTS`, data placeholder) tidak diimpor di mana pun.
- Skill tidak punya kategori/level; hanya pasangan nama → ikon.

## 3. Dependensi

Hasil pencarian impor (`grep` atas `src/`, `next.config.mjs`, `postcss.config.js`, `tailwind.config.ts`):

| Paket | Status (FAKTA) | Catatan |
|---|---|---|
| `zustand` | **0 impor** | Tidak terpakai sekarang, tetapi direncanakan dipakai di Fase 3 → **jangan dihapus**. |
| `react-scroll` + `@types/react-scroll` | **0 impor** | Kandidat hapus. |
| `@mdx-js/react` | 0 impor | Peer opsional `@next/mdx`. Ragu → tidak dihapus. |
| `@mdx-js/loader` | 0 impor langsung | Peer wajib `@next/mdx` → tetap. |
| `@next/mdx` | hanya di `next.config.mjs` | Tidak ada halaman `.mdx` di `src/app`; semua MDX lewat `next-mdx-remote`. DUGAAN: bisa dilepas, tapi menyentuh konfigurasi build → hanya rekomendasi. |
| `@emotion/react` | 0 impor langsung | Peer wajib `@emotion/styled` (5 file) → tetap. |
| `@vercel/postgres` | 2 file (`api/views`, `api/table/views`) | Lihat §4. Paket sudah deprecated oleh Vercel (Vercel Postgres dipindah ke Neon); DUGAAN dari pengetahuan umum, tidak diverifikasi online karena akses web dibatasi. |
| `aos` vs `framer-motion` | `aos`: 15 atribut `data-aos` + init di `providers.tsx:9`; `framer-motion`: 18 file | **Duplikasi fungsi animasi.** Penggantian butuh persetujuan (Fase 1 aturan 3). |
| `react-spinners`, `react-loading-skeleton` | dipakai | — |
| `react-infinite-scroll-component` 7.0.0 | dipakai (`Projects.tsx`) | Peer `react@^17` → peringatan saat install. |
| `axios` vs `fetch` | 4 file | Bisa diganti `fetch` bawaan; bukan prioritas. |
| `swr` | 4 file | Lihat §4. |

Versi (terpasang → terbaru di npm, 2026-10-12): `next` 16.2.2→16.4.0, `react/react-dom` 19.2.4→19.3.0, `axios` 1.14.0→1.20.0, `postcss` 8.5.9→8.5.29, `prettier` 3.8.1→3.9.10, `typescript-eslint` 8.58.1→8.71.1, `eslint` 10.2.0→10.12.0, `@types/node` 25.5.2→26.6.5.

Lockfile (FAKTA): ada **dua** lockfile. `yarn.lock` sinkron dengan `package.json` (next 16.2.2); `package-lock.json` **basi** (masih `next` 15.5.14) dan terakhir diubah sebelum upgrade terakhir. Bot Depfu memperbarui `yarn.lock`. DUGAAN: Vercel memakai yarn karena `yarn.lock` ada — perlu dikonfirmasi pemilik (lihat Pertanyaan Terbuka).

## 4. Backend/data

| Fitur | Ketergantungan (FAKTA) | Pemanggil |
|---|---|---|
| Hitung view blog | `@vercel/postgres` di `src/app/api/views/route.ts` | **Tidak ada pemanggil** di `src/` (grep `/api/views` kosong) → fitur mati. |
| Buat tabel `views` | `src/app/api/table/views/route.ts` menjalankan `CREATE TABLE` via **GET publik** | Tidak ada pemanggil. Risiko keamanan ringan (siapa pun bisa memanggil). |
| Kontribusi GitHub (dashboard) | `axios` → GraphQL GitHub, env `GITHUB_READ_USER_TOKEN_PERSONAL` (`constant/github.ts:4`) | `Contributions.tsx:23` via SWR `/api/github?type=personal` |
| Form kontak | `axios` → web3forms, env `CONTACT_FORM_API_KEY` (`api/contact/route.ts:3`) | `ContactForm.tsx:50` |
| Learn count | fs (`getMdxFileCount`) | `LearnCard.tsx:21` via SWR |
| Daftar novel | konstanta in-memory | `NovelList.tsx`, `NovelFeaturedSection.tsx` via SWR |
| `/api/content` | fs MDX | **Tidak ada pemanggil** |

Kesimpulan: **tidak ada fitur yang terlihat pengguna yang bergantung pada `@vercel/postgres`** — hanya dua endpoint tanpa pemanggil. Jalur penggantian jelas (hapus atau migrasi ke Neon) → tidak memblokir.

Variabel env yang dirujuk kode (nama saja): `CONTACT_FORM_API_KEY`, `GITHUB_READ_USER_TOKEN_PERSONAL`, `POSTGRES_URL` (implisit oleh `@vercel/postgres`). `.env.example` juga mencantumkan `SITE_URL`, `DEVTO_KEY`, `WAKATIME_*`, `POSTGRES_*`, `NEXTAUTH_URL`, `BUNDLE_ANALYZER` yang tidak dirujuk kode (`grep process.env`).

Lain-lain (FAKTA): gerbang novel memakai kunci teks yang di-hardcode di klien (`src/common/context/NovelAuthContext.tsx:46`) dan cookie `novelAuth`; ini bukan proteksi nyata. Nilai tidak dikutip di laporan.

## 5. Styling

**FAKTA**
- Tailwind 4 via `@tailwindcss/postcss`, tetapi masih memakai **konfigurasi JS lama** lewat `@config "../../../tailwind.config.ts"` (`globals.css:3`). Belum ada blok `@theme`.
- Token yang ada: `tailwind.config.ts:19-23` warna `darkText #E4E6EB`, `dark #121212`, `light #fafafa`; font `sans/sora/code/emoji`; keyframes/animation `wave, flying, badge, loop`. Duplikat di CSS: `--color-dark`, `--color-light` (`globals.css:5-8`).
- **Bug font**: `fonts.ts:11` mendefinisikan variabel `--font-fira-code`, sedangkan `tailwind.config.ts:16` merujuk `var(--firaCode-font)` → kelas `font-code` tidak pernah memakai Fira Code (tidak ada pemakaian `font-code` saat ini, jadi tidak terlihat).
- `next-themes` dengan `attribute="class"`, `defaultTheme="dark"` (`providers.tsx:16`); `darkMode: 'class'` (`tailwind.config.ts:5`).

Contoh nilai hardcoded:

| Lokasi | Nilai |
|---|---|
| `globals.css:16-20` | gradien body `rgb(45 212 191 / 15%)` |
| `globals.css:43` | warna bar NProgress `#15b8a6` |
| `Loading.tsx:17-18` | `#36d7b7` (prop & `text-[#36d7b7]`) |
| `SkeletonLoader.tsx:13-14` | `#ebebeb/#202020`, `#f5f5f5/#2e2e2e` |
| `Skills.tsx:70,73` | `#121212` di gradien fade (emotion) |
| `ThemeToggleButton.tsx:154-184` | `#f7f7e7 #93d4cc #c7dfc3 #173754 #388296 #ffffff` |
| `BlogFeaturedHero.tsx:127`, `NovelFeaturedHero.tsx:123` | `border-[#ffffff1a]` |
| `NovelAuth.tsx:45` | `dark:bg-[#1b1b1b80]` |
| `layout.tsx:92` | `theme-color #000000` |
| Ukuran teks arbitrer | `text-[15px]` ×9, `text-[13px]` ×8, `text-[14px]` ×5, `leading-[1.8]` ×7, `text-[18px]`, `text-[12px]`, `text-[.9375rem]` |
| Dimensi arbitrer | `max-w-[1024px]` (`layouts/index.tsx:52`), `max-w-[790px]`, `min-w-[326px]` ×3, `h-[400px]` ×4 |
| Warna ikon stack | kelas Tailwind palet bawaan per brand (`stacks.tsx`) — warna merek, bukan token tema |

## 6. Hasil type-check, lint, build (baseline sebelum perubahan)

| Perintah | Hasil | Sebab (FAKTA) |
|---|---|---|
| `yarn type-check` (`tsc --noEmit`) | **GAGAL** (exit 2) | `tsconfig.json(3,15): error TS5107: Option 'target=ES5' is deprecated` — TypeScript 6.0.2. Dengan `--ignoreDeprecations 6.0` → 0 error lain. |
| `yarn lint` (`next lint`) | **GAGAL** (exit 1) | `next lint` sudah dihapus di Next 16 ("Invalid project directory provided … /lint"). `npx eslint src` juga gagal: ESLint 10 tidak lagi mendukung `.eslintrc.json`. |
| `yarn build` | **HIJAU** (exit 0) | Peringatan: `metadataBase` tidak di-set (OG memakai `http://localhost:3000`); caniuse-lite usang; `MODULE_TYPELESS_PACKAGE_JSON` untuk `tailwind.config.ts`. |

Kegagalan type-check dan lint **sudah ada sebelum pekerjaan ini** dan sebabnya jelas → ditangani di Fase 1.

## 7. PR terbuka (11)

Diakses via GitHub API. Tidak ada PR yang dibuat manusia; semuanya bot.

| # | Judul | Bot | Risiko | Rekomendasi |
|---|---|---|---|---|
| 215 | prettier 3.8.1 → 3.9.10 | Depfu | Rendah (bisa ubah format) | Terapkan di Fase 1 bila lint tetap hijau. |
| 214 | 🚨 nextjs 16.2.2 → 16.4.0 (31 advisory) | Depfu | Sedang (minor framework) | **Prioritas**; terapkan di Fase 1 jika build hijau. |
| 213 | typescript-eslint 8.58.1 → 8.71.1 | Depfu | Rendah | Terapkan bersama perbaikan lint. |
| 212 | 🚨 postcss 8.5.9 → 8.5.29 (4 advisory) | Depfu | Rendah (patch) | Terapkan. |
| 202 | react/react-dom 19.2.4 → 19.3.0 | Depfu | Sedang; R3F 9.8.1 mendukung `react >=19 <19.4` | Terapkan jika build hijau. |
| 197 | 🚨 axios 1.14.0 → 1.20.0 (43 advisory) | Depfu | Rendah | Terapkan. |
| 163 | @types/node 25.5.2 → 25.9.3 | Depfu | Rendah | Terapkan. |
| 159 | react-infinite-scroll-component 7.0.0 → 7.2.1 | Depfu | Rendah | Terapkan. |
| 66 | cross-spawn 7.0.3 → 7.0.6 (2024) | Dependabot | Usang; menyasar `package-lock.json` yang basi | Tutup oleh pemilik setelah keputusan lockfile. |
| 51 | next 14.2.3 → 14.2.10 (2024) | Dependabot | Usang (sudah di 16.x) | Tutup oleh pemilik. |
| 48 | micromatch 4.0.5 → 4.0.8 (2024) | Dependabot | Usang, menyasar lockfile npm | Tutup oleh pemilik. |

Saya tidak merge/menutup PR apa pun.

## 8. URL publik, metadata, sitemap, robots, OG

Akses langsung ke `https://fihaa.my.id` diblokir oleh proxy lingkungan (CONNECT 403), jadi daftar URL disusun **dari kode** (bukan dari situs live).

**Daftar URL lama (dasar redirect Fase 3)**

| URL lama | Jumlah instance | Sumber slug |
|---|---|---|
| `/` | 1 | — |
| `/about`, `/contact`, `/dashboard` | 3 | — |
| `/projects`, `/projects/:slug` | 1 + 25 | nama file `src/contents/projects` |
| `/blog`, `/blog/:slug` (+ `?id=`, `?page=&search=`) | 1 + 3 | nama file `src/contents/blogs` |
| `/learn`, `/learn/:slug`, `/learn/:slug/:content` | 1 + 1 + 3 | `constant/learn.ts`, `src/contents/learns/react-2024` |
| `/novel`, `/novel/:slug`, `/novel/:slug/:content` | 1 + 1 + 1 | `constant/novel.ts` (menu Novel dikomentari di `menu.tsx:68-76`, tetapi route tetap hidup) |
| Tetap di tempat: `/api/*`, `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, `/icon.ico`, `/apple-icon.png`, `/manifest.json`, `/ads.txt`, `/images/*` | — | — |

- **Metadata**: global di `layout.tsx:15-73` (title, OG `/images/fihaa.png` 1200×630, twitter `@fihaa_dev`, robots index/follow); per halaman via `metadata`/`generateMetadata`. `canonical` hanya di `page.tsx:55-57` (beranda). **`metadataBase` tidak di-set** (peringatan build).
- **Sitemap** `src/app/sitemap.ts`: 8 URL statis hard-coded (`/`, `/dashboard`, `/projects`, `/blog`, `/learn`, `/novel`, `/about`, `/contact`); tidak ada URL detail.
- **Robots** `src/app/robots.ts`: allow `/`, disallow `/api/`, `/dashboard/`, `/_next/`, `/private/`, `/*.json$`, `/*.xml$`; memblokir GPTBot, ChatGPT-User, CCBot, anthropic-ai, Claude-Web. Catatan: `/dashboard` ada di sitemap sekaligus di-disallow robots (kontradiksi).
- `src/common/components/seo/MetaTags.tsx` memakai `next/head` (Pages Router API) dan **tidak dipakai**.

## 9. Risiko menambah three / @react-three/fiber / @react-three/drei

FAKTA (metadata npm, 2026-10-12):
- `@react-three/fiber@9.8.1` peer: `react >=19 <19.4`, `react-dom >=19 <19.4`, `three >=0.156`.
- `@react-three/drei@10.7.9` peer: `react ^19`, `@react-three/fiber ^9.0.0`, `three >=0.159`; dependensi termasuk `zustand ^5` (sudah ada di repo).
- `three@0.186.1`, `@types/three@0.186.0`. Ketiganya dirilis ≥ 2 minggu lalu (24–25 Sep 2026).

Risiko:
1. **SSR**: three/R3F mengakses `window`/WebGL → wajib `next/dynamic(..., { ssr: false })` di dalam Client Component (di App Router `ssr:false` tidak boleh dipanggil dari Server Component).
2. **Bundle**: three ±600 KB+ min; harus dipastikan hanya ter-bundle di chunk `/world`. Root layout saat ini memuat banyak hal global (AOS, emotion, framer) — `/world` sebaiknya punya layout tanpa sidebar 2D.
3. **React 19.4**: jika React naik ke 19.4 sebelum R3F memperluas peer range, akan konflik. 19.3.0 (PR 202) masih aman.
4. **`next.config.mjs`**: ada override `webpack` (`fs:false`), tetapi build memakai **Turbopack** (keluaran build), jadi override ini tidak berlaku. Tidak perlu `transpilePackages` untuk three modern (DUGAAN, diverifikasi di Fase 4).
5. **Hidrasi**: `Layout` memakai `useTheme` + `usePathname`; Canvas di dalamnya tidak berisiko hidrasi jika di-render client-only.

## 10. i18n dan next-themes

- **Tidak ada i18n** (FAKTA: tidak ada lib i18n, `<html lang="en">` di `layout.tsx:86`). Konten campuran: UI Inggris, isi proyek/blog Bahasa Indonesia. Sesuai aturan, i18n tidak ditambahkan.
- `next-themes`: `ThemeProvider attribute="class" defaultTheme="dark"` (`providers.tsx:16`), dipakai di `ThemeToggleButton`, `SkeletonLoader`, `layouts/index.tsx`. `enableSystem` default aktif, tetapi `layouts/index.tsx:23` memperlakukan `resolvedTheme === 'system'` sebagai gelap (resolvedTheme tidak pernah bernilai `system`; DUGAAN: kode mati yang tidak berbahaya).

---

## Gerbang setelah Fase 0

| Kriteria berhenti | Status |
|---|---|
| Build gagal tanpa sebab jelas | Tidak — build hijau. type-check/lint gagal dengan sebab jelas (TS 6 deprecation, ESLint 10/Next 16). |
| Pages Router | Tidak — App Router. |
| Fitur kritis bergantung layanan deprecated tanpa jalur pengganti | Tidak — `@vercel/postgres` hanya dipakai dua endpoint tanpa pemanggil. |
| Pertanyaan Terbuka yang memblokir | Tidak — pertanyaan di bawah bisa dijawab belakangan; asumsi aman dicatat. |

**Keputusan: lanjut ke Fase 1.**

## Rekomendasi urutan kerja

1. Fase 1: perbaiki type-check (TS 6) dan lint (flat config), terapkan PR keamanan (next, axios, postcss) + PR minor aman, hapus `react-scroll`.
2. Fase 2: `content/` + `src/lib/content` untuk proyek, skill, pengalaman (karier/pendidikan/organisasi), kontak.
3. Fase 3: pindah ke `/2d`, redirect 308, landing, preferensi mode.
4. Fase 4: R3F di `/world` terisolasi.
5. Fase 5: `@theme` token.
6. Setelah itu (perlu keputusan): ganti AOS → framer-motion, hapus endpoint postgres, rapikan lockfile.

## Pertanyaan Terbuka

1. **Strategi branch**: sesi ini dikonfigurasi untuk push ke `claude/clever-albattani-e7tn9x`, sedangkan instruksi meminta branch per fase. Saya membuat branch per fase bertumpuk (fase N bercabang dari fase N-1) dan juga mendorong hasil akhir ke branch sesi. Konfirmasi apakah ini sesuai.
2. **Lockfile**: mana yang dipakai Vercel — `yarn.lock` (sinkron) atau `package-lock.json` (basi)? Rekomendasi: hapus `package-lock.json`. Tidak saya hapus tanpa konfirmasi.
3. **Endpoint `@vercel/postgres`** (`/api/views`, `/api/table/views`) tidak dipakai. Hapus, atau pertahankan untuk fitur view-count di masa depan (migrasi ke Neon)?
4. **AOS vs framer-motion**: setuju menghapus AOS dan memakai framer-motion saja? (butuh persetujuan).
5. **Halaman yang ikut ke `/2d`**: saya mengasumsikan SEMUA halaman (termasuk blog, learn, novel, dashboard) pindah ke `/2d/...`. Konfirmasi, atau sebagian tetap di root?
6. **`/` lama**: setelah migrasi, `/` menjadi landing (bukan redirect). Konten beranda lama tersedia di `/2d`. Konfirmasi bahwa ini yang diinginkan secara SEO (canonical beranda berubah).
7. **Novel**: menu dinonaktifkan tetapi route hidup dan masuk sitemap. Tetap dipertahankan?
8. **i18n**: tidak ada; konten campuran EN/ID. Perlu i18n untuk dunia 3D atau tidak? (tidak ditambahkan).
9. **`id` proyek duplikat (20)**: urutan mana yang benar untuk `dcc` vs `persuratan-iain-parepare`?

## Self-review Fase 0

1. Semua 10 butir audit tercakup; URL live tidak dapat diakses (proxy 403) → dicatat, daftar dari kode.
2. Klaim diberi path/baris atau keluaran perintah; interpretasi ditandai DUGAAN.
3. Tidak ada perubahan kode; hanya file ini (`git status` diverifikasi).
4. Tidak ada nilai rahasia; hanya nama variabel env. Kunci novel tidak dikutip.
5. Baseline: build hijau, type-check & lint merah (sudah ada sebelumnya, sebab jelas).
6. Routing belum diubah → belum ada risiko 404.
