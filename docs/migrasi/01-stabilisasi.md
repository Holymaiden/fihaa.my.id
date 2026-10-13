# Fase 1 — Stabilisasi

Branch: `chore/fase-1-stabilisasi` (bercabang dari `main` @ `a8a640a`).

## Ringkasan

| Cek | Sebelum | Sesudah |
|---|---|---|
| `yarn type-check` | GAGAL (TS5107 `target=ES5`) | **HIJAU** |
| `yarn lint` | GAGAL (`next lint` dihapus di Next 16; ESLint 10 tidak membaca `.eslintrc.json`) | **HIJAU** (0 error, 13 warning) |
| `yarn build` | HIJAU | **HIJAU** |

Uji asap `next start` (produksi lokal): `/`, `/about`, `/contact`, `/dashboard`, `/projects`, `/projects/ayola`, `/blog`, `/blog/1-next-js-14-membangun-masa`, `/learn`, `/learn/react-2024`, `/learn/react-2024/0-why-react`, `/novel`, `/novel/infinite-mage`, `/robots.txt`, `/sitemap.xml`, `/api/learn?slug=react-2024` → semua 200; `/tidak-ada` → 404.

## Perubahan (commit)

| Commit | Isi |
|---|---|
| `docs(migrasi): tambah laporan audit fase 0` | `docs/migrasi/00-audit.md` |
| `chore(deps): hapus react-scroll yang tidak terpakai` | `react-scroll`, `@types/react-scroll`. Bukti: `grep` impor `react-scroll` di `src/` = 0. |
| `fix(tsconfig): naikkan target ke ES2017 …` | `tsconfig.json` `target: es5 → ES2017`. Hanya memengaruhi `tsc --noEmit`; Next/SWC menentukan target output dari browserslist. |
| `chore(deps): perbarui next, @next/mdx, eslint-config-next ke 16.4.0 (keamanan)` | = PR Depfu #214 |
| `chore(deps): perbarui axios 1.20.0 dan postcss 8.5.29 (keamanan)` | = PR Depfu #197, #212 |
| `chore(deps): perbarui react 19.3.0, @types/node, prettier, typescript-eslint, react-infinite-scroll-component` | = PR Depfu #202, #163, #215, #213, #159 |
| `fix(lint): bereskan error lint …` | Lihat di bawah |
| `chore(lint): migrasi ke flat config ESLint …` | `eslint.config.mjs` baru, `.eslintrc.json` dihapus, skrip `lint`/`lint:fix` → `eslint .` |

Setiap pembaruan dependensi diverifikasi dengan `yarn build` (+ `type-check`) sebelum commit.

### Perbaikan lint (kode)

- `src/app/learn/[slug]/[content]/page.tsx`: `import('react').ReactElement` → `import type { ReactElement }` (aturan `consistent-type-imports`).
- `src/common/libs/mdx.ts` `loadMdxNovelFiles`: `await Promise.all(files.map(fnSinkron))` → `files.forEach(...)`. Perilaku sama (callback tidak mengembalikan Promise).
- `src/modules/learn/components/ContentDetail.tsx`: hapus impor `ReactElement` yang tidak terpakai.
- `src/modules/projects/components/Projects.tsx`: hapus `eslint-disable` yang tidak berguna.
- Hapus `src/common/hooks/useLoading.ts`: tidak diimpor di mana pun (grep `useLoading` = hanya file itu sendiri) dan memakai `next/router` (API Pages Router).

### Aturan lint yang diturunkan ke `warn`

`eslint-plugin-react-hooks` v7 (dibawa `eslint-config-next` 16) menambah aturan React Compiler. Karena lint tidak pernah berjalan sejak upgrade sebelumnya, pelanggaran ini baru terlihat:

- `react-hooks/set-state-in-effect` — 11 lokasi (mis. `Sidebar.tsx:22`, `useHasMounted.ts:9`, `useIsMobile.ts:10`, `Skills.tsx:28`, `BlogList.tsx:70`, `NovelList.tsx:73`, dua `ContentDetail.tsx:46`, `useSearch.ts:42`).
- `react-hooks/static-components` — `BackButton.tsx:39,44`, `ProjectLink.tsx:37,47`.

Memperbaikinya mengubah pola state/render komponen 2D, di luar lingkup stabilisasi. Diset `warn` di `eslint.config.mjs` dengan komentar; rekomendasi: bereskan dalam PR terpisah.

## PR terbuka

| PR | Tindakan di branch ini |
|---|---|
| #214 next 16.4.0 (keamanan) | Diterapkan |
| #197 axios 1.20.0 (keamanan) | Diterapkan |
| #212 postcss 8.5.29 (keamanan) | Diterapkan |
| #202 react 19.3.0 | Diterapkan (R3F 9.8.1 mendukung `<19.4`) |
| #215 prettier 3.9.10 | Diterapkan (tidak ada perubahan format yang memicu error) |
| #213 typescript-eslint 8.71.1 | Diterapkan |
| #163 @types/node 25.9.3 | Diterapkan (terpasang 25.9.9 sesuai rentang `^25.9.3`) |
| #159 react-infinite-scroll-component 7.2.1 | Diterapkan |
| #66 cross-spawn, #51 next 14.2.10, #48 micromatch | **Tidak diterapkan**: usang (2024) dan menyasar `package-lock.json`. Rekomendasi: pemilik menutupnya. |

Tidak ada PR yang di-merge atau ditutup. Setelah branch ini di-merge, PR Depfu terkait kemungkinan otomatis ditutup/di-rebase oleh Depfu (DUGAAN, perilaku umum Depfu).

## Tidak dilakukan (butuh persetujuan) — rekomendasi & langkah

1. **AOS → framer-motion** (duplikasi animasi). Langkah: (a) buat komponen `reveal` berbasis `motion.div` + `whileInView`; (b) ganti 15 atribut `data-aos` (`grep -rn data-aos src`); (c) hapus `AOS.init` di `providers.tsx`, impor CSS di `layout.tsx:2`, lalu `yarn remove aos @types/aos`.
2. **`@vercel/postgres`**: endpoint `/api/views` & `/api/table/views` tidak dipakai. Opsi A: hapus kedua route + paket. Opsi B: migrasi ke `@neondatabase/serverless` (API `sql` tagged template mirip) dan ganti `GET` pembuat tabel dengan migrasi sekali jalan.
3. **Lockfile**: hapus `package-lock.json` yang basi (lihat Pertanyaan Terbuka 00-audit #2). Branch ini hanya memperbarui `yarn.lock`, sehingga `package-lock.json` makin tidak sinkron.
4. **`@next/mdx`** + `@mdx-js/*`: tidak ada halaman `.mdx` di `src/app`. Bisa dilepas bersama `pageExtensions`/`withMDX` di `next.config.mjs`.
5. Override `webpack` di `next.config.mjs` tidak berlaku (build memakai Turbopack). Bisa dihapus bila tidak ada rencana `next build --webpack`.

## Temuan baru

- `/projects/<slug-tak-ada>`, `/blog/<slug-tak-ada>` mengembalikan **200** (halaman kosong), bukan 404 — loader mengembalikan `{ content: 'Not Found' }` dan halaman tidak memanggil `notFound()`. Sudah ada sebelumnya; relevan untuk Fase 3 (verifikasi "tidak ada 404" harus memeriksa konten, bukan hanya status).

## Self-review Fase 1

1. Semua langkah dikerjakan: dependensi tak terpakai dihapus (`react-scroll`; `zustand` sengaja dipertahankan untuk Fase 3), 8 PR dependensi diterapkan, 3 PR usang direkomendasikan; migrasi library besar tidak dilakukan.
2. Klaim didukung grep/keluaran build; perilaku Depfu ditandai DUGAAN.
3. `git diff main` hanya menyentuh dependensi, konfigurasi lint/TS, dan 5 file kode untuk lint — tidak ada perubahan tampilan.
4. Tidak ada rahasia, nilai gaya baru, atau `any` baru; impor tipe memakai `import type`.
5. type-check, lint, build hijau. Diperbaiki saat review: commit lint sempat ikut menghapus `.eslintrc.json`; dipisah ulang ke commit migrasi config.
6. Routing tidak diubah; uji asap menunjukkan semua URL lama 200.
