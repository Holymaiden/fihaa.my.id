# Profil, SEO Landing, dan Penghapusan Novel

Branch: `feat/profil-dan-pembersihan` (bercabang dari `refactor/keputusan-lanjutan`). Semua commit ikut ke PR Holymaiden/fihaa.my.id#216.

## Keputusan pemilik

| # | Pertanyaan | Keputusan | Tindakan |
|---|---|---|---|
| 1 | Entitas Profil untuk 3D | Perlu | `content/profile.ts` + `src/lib/content/profile.ts` (lihat di bawah). |
| 2 | Ambang perangkat lemah | Ok, sarankan | Ambang dipertahankan: memori < 4 GB, < 4 core CPU, atau lebar < 768 px → 2D ditandai "Recommended" (tidak memblokir). |
| 3 | SEO landing / `/world` di sitemap | "Bagaimana menurutmu? Kalau ok masukkan" | Landing diberi ringkasan profil (dirender server) + meta description. `/world` diberi meta description tetapi **belum** dimasukkan ke sitemap: isinya hanya canvas WebGL tanpa teks, jadi tampil kosong di hasil pencarian. Masukkan setelah pulau punya panel teks. |
| 4 | Fitur novel | Hapus dari 2D | Lihat di bawah. |
| 5 | PR Dependabot usang | Tutup | Holymaiden/fihaa.my.id#66, Holymaiden/fihaa.my.id#51, Holymaiden/fihaa.my.id#48 ditutup dengan komentar singkat. |

## Entitas Profil

`Profile`: `name`, `shortName`, `handle`, `role`, `location`, `status`, `avatar`, `workStartYear`, `codingStartYear`, `intro[]` (paragraf "About Me" beranda), `story[]` (cerita halaman About). Placeholder `{professionalYears}`, `{totalYears}`, `{codingStart}` diisi saat dibaca (`getProfileIntro()`, `getProfileStory()`, `getProfileYears()`).

Dipakai oleh: `Introduction.tsx` (status, lokasi, tahun, intro), `Story.tsx` (story; markup HTML sama persis dengan sebelumnya), `ProfileHeader.tsx` dan `HeaderTop.tsx` (nama, nama pendek, handle, avatar), landing (nama, peran, lokasi, intro). `src/common/constant/about.ts` dihapus.

Bukti tampilan sama: HTML `/2d/about`, `/2d/blog`, `/2d/projects`, `/2d/contact` identik; `/2d` hanya berbeda penanda komentar React di paragraf intro (`over<!-- --> <!-- -->5` → `over 5`), teks yang terlihat sama.

Tidak dipindah: teks metadata SEO per halaman dan tautan GitHub di `Copyright.tsx` (atribusi).

## Penghapusan novel

Dihapus: halaman `src/app/2d/novel/**`, `/api/novel`, `src/modules/novel`, `constant/novel.ts`, `types/novel.ts`, gerbang kunci (`NovelAuth.tsx`, `NovelAuthContext.tsx`), loader novel di `mdx.ts`, helper `groupContentSlice25`, konten `src/contents/novels`, gambar `public/images/novel`, entri sitemap, item menu yang dikomentari, dan dependensi yang hanya dipakai novel: `next-client-cookies`, `@headlessui/react`. Total ±1.880 baris.

URL lama tidak rusak: `/novel/:path*` dan `/2d/novel/:path*` → 308 ke `/2d`. `/api/novel` kini 404 (endpoint internal tanpa pemanggil lain).

## Bukti

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau.
- 55 URL lama tetap 200 (`bukti/08-url-lama.tsv`); 4 URL novel kini berakhir di `/2d`.
- HTML server `/` memuat paragraf intro dan meta description; sitemap tanpa novel dan tanpa `/world`.
- Playwright: about (3 slider), blog, learn prev/next, Back proyek, menu header & mobile, tanpa error konsol/hidrasi.

## Self-review

1. Kelima keputusan tercakup; pendapat untuk no. 3 dicatat beserta alasannya.
2. Klaim didukung build/lint/type-check, diff HTML, `curl`, dan Playwright.
3. Diff terbatas pada profil, landing, penghapusan novel, dan laporan.
4. Tidak ada `any`, rahasia, atau nilai gaya baru; komentar kode berbahasa Inggris.
5. type-check, lint, build hijau.
6. Tidak ada URL lama yang 404.
