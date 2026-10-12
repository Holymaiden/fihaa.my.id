# Keputusan Lanjutan

Branch: `refactor/keputusan-lanjutan` (bercabang dari `feat/tindak-lanjut-keputusan`).

## Keputusan pemilik

| # | Keputusan | Tindakan |
|---|---|---|
| 1 | Hapus `@vercel/postgres` | Paket, `/api/views`, `/api/table/views` (yang menjalankan `CREATE TABLE` lewat GET publik), dan blok `POSTGRES_*` di `.env.example` dihapus. Kedua URL kini 404. Variabel env `POSTGRES_*` dan database di Vercel/Neon tidak saya sentuh (di luar wewenang); bisa dihapus manual bila tidak dipakai. |
| 2 | Ganti AOS dengan framer-motion | Komponen baru `src/common/components/elements/reveal.tsx` meniru animasi AOS yang dipakai (`fade-up` 100px, `flip-right` rotateY 100°, `flip-up` rotateX −100°; 800 ms, delay 50 ms, easing CSS `ease`, offset 120 px). `Container` menerima prop `reveal` menggantikan `data-aos` (13 halaman); `HeaderTop` memakai `Reveal` untuk ikon verified dan menu. `aos`, `@types/aos`, `aos-init.tsx`, CSS AOS dihapus. Perbedaan: animasi hanya sekali (`once: true`), sedangkan AOS bisa memutar ulang saat elemen keluar-masuk dari bawah layar. |
| 3 | Refactor 13 peringatan React Compiler | Semua diperbaiki; `react-hooks/set-state-in-effect` dan `static-components` kembali `error` (default). `yarn lint` kini 0 masalah. |
| 4 | Blog/learn/novel tidak tampil di 3D | Tetap di `src/contents/`, tidak dipindah ke `content/`. |
| 5 | Ya (kategori skill + daftar stasiun 3D) | Lihat di bawah. Entitas **Profil** belum dijawab, jadi belum dibuat. |

## Detail refactor lint (poin 3)

| File | Masalah | Perbaikan |
|---|---|---|
| `BackButton.tsx`, `ProjectLink.tsx` | komponen didefinisikan di dalam render | dipindah ke level modul (`ProjectLink` meneruskan `projectTitle` sebagai prop) |
| `useHasMounted.ts`, `useIsMobile.ts` | `setState` di effect | `useSyncExternalStore` (server `false`, klien nilai sebenarnya — perilaku sama) |
| `Sidebar.tsx` | `isClient` lewat effect | `useHasMounted()` |
| `useSearch.ts` | hasil pencarian disalin ke state | `results` diturunkan langsung dengan `useMemo` |
| `BlogList.tsx`, `NovelList.tsx` | state `page` disinkronkan dari URL lewat effect | `page` diturunkan dari `?page=` |
| `learn/` & `novel/ContentDetail.tsx` | judul prev/next disalin ke state saat `slug` berubah | diturunkan dari props (judul kini sudah benar sejak render server) |
| `Skills.tsx` | acak di effect + acak ulang tiap render | tiga urutan dibuat sekali di klien (`useSyncExternalStore`); sebelumnya urutan slider berubah di setiap re-render |

## Bug lama tambahan yang ditemukan saat pengujian

- **Hidrasi gagal di ponsel**: `ProfileHeader` memilih nama dari `window.innerWidth` saat render → server "M. Fiqri Haikhar Anwar", klien (< 429 px) "Fihaa" → React error #418 dan seluruh pohon dirender ulang. Kini memakai `useIsMobile(429)`. Diverifikasi: 390 px → "Fihaa", 600/1280 px → nama lengkap, tanpa error.
- **`<main>` bersarang**: `Layout` membungkus halaman dengan `<main>` kedua di dalam `<main id="main-content">`. Yang di dalam diganti `<div>` (tanpa perubahan gaya).
- Catatan (tidak diubah): di mode dev muncul peringatan React "Encountered a script tag while rendering React component", berasal dari skrip tema `next-themes` 0.4.x dengan React 19. Tidak berpengaruh di produksi.

## Kategori skill & stasiun 3D (poin 5)

- `SkillCategory`: `language`, `frontend`, `ui`, `backend`, `mobile`, `tooling`; tiap skill di `content/skills.ts` punya `category` (mis. Golang → language, Next.js → frontend, TailwindCSS → ui, Laravel → backend, Expo → mobile, Vercel → tooling). Helper `getSkillsByCategory()` untuk dunia 3D.
- `WorldStationId` kini union `'projects' | 'skills' | 'experience' | 'contact'` (satu pulau per jenis konten), daftar di `content/world.ts` + `getWorldStations()`. Field `worldStation` per entri tetap kosong (stasiun mengikuti jenis konten secara default).
- Keduanya draf; nama dan pengelompokan mudah diganti saat pulau didesain. Tampilan 2D tidak berubah (kategori belum dipakai 2D).

## Bukti

- `yarn type-check` hijau · `yarn lint` **0 masalah** · `yarn build` hijau.
- 55 URL lama tetap 200 (`bukti/07-url-lama.tsv`); `/api/views`, `/api/table/views`, slug tak ada → 404.
- Isolasi bundle tetap (three hanya di `/world`); JS halaman 2D turun ±13 KB setelah AOS dihapus (`/2d`: 1.006.955 → 993.972 byte tanpa kompresi).
- Playwright: 3 slider skill × 33 tag, urutan stabil setelah re-render; container about selesai beranimasi (`opacity: 1`, `transform: none`); paginasi blog; judul prev/next learn; Back proyek; menu header & mobile; tanpa error konsol/hidrasi.

## Self-review

1. Kelima keputusan tercakup; Profil belum dijawab → tidak dibuat.
2. Klaim didukung build/lint/type-check, `curl`, dan Playwright.
3. Diff terbatas pada dependensi, endpoint, animasi, refactor lint, bug hidrasi, dan konten skill/stasiun. Urutan commit diperbaiki agar setiap commit lolos type-check.
4. Tidak ada `any`, rahasia, atau nilai gaya baru; komentar kode berbahasa Inggris.
5. type-check, lint, build hijau.
6. Tidak ada URL lama yang 404.
