# Fase 2 — Konsolidasi Konten

Branch: `refactor/fase-2-konten` (bercabang dari `chore/fase-1-stabilisasi`).

## Struktur baru

```
content/                      # sumber konten bersama 2D + 3D
├── projects/*.mdx            # 25 proyek (dipindah dari src/contents/projects, git mv)
├── skills.ts                 # 33 skill (nama)
├── experience.ts             # karier, pendidikan, organisasi
└── contact.ts                # tautan kontak + URL resume
src/lib/content/
├── types.ts                  # skema bertipe
├── projects.ts               # getProjects(), getProjectBySlug()   — server-only (fs)
├── skills.ts                 # getSkills()
├── experience.ts             # getCareers(), getEducation(), getOrganizations()
└── contact.ts                # getContactLinks(), getContactLink(), getResumeUrl()
```

Alias `@content/*` → `./content/*` ditambahkan di `tsconfig.json`. Hanya `src/lib/content/*` yang mengimpor `@content/*` (diverifikasi `grep`). Tidak ada barrel `index.ts` agar modul `fs` (`projects.ts`) tidak ikut terimpor oleh Client Component (`Skills.tsx`, `CareerList.tsx`, dll. adalah `'use client'`).

## Skema (`src/lib/content/types.ts`)

| Tipe | Field | Catatan |
|---|---|---|
| `ProjectFrontmatter` | `id, title, slug, description, cover_url?, stacks, link_demo?, link_github?, is_featured?` + 3D `worldStation?`, `thumbnail?` | Sama dengan frontmatter MDX yang ada (§2 audit). |
| `ProjectEntry` | `slug` (nama file), `frontMatter`, `content?` | |
| `Skill` | `name` + 3D `worldStation?` | `name` juga kunci ikon di `STACKS`. |
| `Career`, `Education`, `Organization` | field identik dengan tipe lama (`snake_case` dipertahankan) + 3D `worldStation?` | |
| `ContactLink` | `channel` (`email\|linkedin\|facebook\|instagram\|github`), `label`, `href`, `eventName` | |
| `Contact` | `links`, `resumeUrl` | |
| `WorldStationId` | `string` | Daftar nilai belum diputuskan; tidak ada entri yang mengisinya. |

## Yang dipindah

| Data | Dari | Ke | Pembaca |
|---|---|---|---|
| Proyek | `src/contents/projects/*.mdx` + `loadMdxFiles/loadMdxFile` | `content/projects/*.mdx` | `src/lib/content/projects.ts` |
| Skill | kunci `STACKS` di `src/common/constant/stacks.tsx` | `content/skills.ts` | `getSkills()` di `Skills.tsx` |
| Karier/pendidikan/organisasi | `src/common/constant/{careers,education,organization}.ts` (dihapus) | `content/experience.ts` | `*List.tsx`, `*Card.tsx` |
| Kontak | data di `SOCIAL_MEDIA` (`constant/menu.tsx`), URL LinkedIn di `TopBar.tsx`, URL resume di `Resume.tsx` | `content/contact.ts` | `menu.tsx`, `TopBar.tsx`, `Resume.tsx` |

Pemisahan data vs presentasi: ikon `react-icons` dan kelas warna merek tetap di lapisan 2D (`constant/stacks.tsx`, `CONTACT_PRESENTATION` di `constant/menu.tsx`), karena dunia 3D tidak bisa memakai elemen JSX/kelas Tailwind tersebut.

Juga dihapus: `src/common/types/{careers,education,organization}.ts` (diganti tipe di `lib/content`), `src/common/constant/project.ts` (placeholder tak diimpor). `src/common/types/projects.ts` kini merujuk `ProjectFrontmatter`.

## Bukti tampilan 2D tidak berubah

Metode: build produksi branch Fase 1 dan Fase 2 secara bergantian, `next start`, unduh HTML (`curl`), normalisasi hash aset/buildId, lalu `diff`.

| URL | Selisih |
|---|---|
| `/`, `/about`, `/contact`, `/projects`, `/dashboard`, `/blog` | 0 baris |
| `/projects/ayola`, `/projects/dcc`, `/projects/persuratan-iain-parepare`, `/projects/fihaa-my-id` | 0 baris |
| `/projects/xyz` (slug tidak ada) | Berbeda: `<title>` `undefined \| Fihaa Portfolio` → `Project \| Fihaa Portfolio` (+ meta description), dan `<img>` mendapat `alt=""`. Guard `if (!project)` di `generateMetadata` dulu tidak pernah aktif karena loader lama tak pernah mengembalikan `null`. Konten halaman tetap sama ("Default Title", "Not Found"). |

Catatan: daftar skill diacak di klien (`Skills.tsx`), urutan sumber identik dengan urutan kunci `STACKS` lama.

File tracing Vercel: `.next/server/app/projects/[slug]/page.js.nft.json` memuat 25 file `content/projects/*.mdx` → file MDX ikut ter-deploy.

## Hasil cek

`yarn type-check` hijau · `yarn lint` 0 error (13 warning yang sama dengan Fase 1) · `yarn build` hijau.

## Tidak dipindah (dan alasannya)

- **Blog, Learn, Novel** tetap di `src/contents/` dan dibaca via `src/common/libs/mdx.ts`. Instruksi fase menyebut proyek, skill, pengalaman, kontak. Memindahkan ketiganya mudah (ubah path) tetapi butuh keputusan apakah konten itu muncul di dunia 3D → Pertanyaan Terbuka.
- **Teks profil** (cerita About di `constant/about.ts`, kartu & paragraf di `modules/home/components/Introduction.tsx`, tagline `Services.tsx`, handle `@holymaiden` di `ProfileHeader.tsx`, tautan GitHub di `Copyright.tsx`) — belum ada entitas "profil" di skema yang diminta. Tautan GitHub di `Copyright.tsx` (`http://github.com/holymaiden`) berbeda dengan tautan kontak (`https://github.com/Holymaiden`), jadi tidak digabung agar `href` tidak berubah.
- `GITHUB_ACCOUNTS` (dashboard) adalah konfigurasi API, bukan konten.

## Pertanyaan Terbuka (Fase 2)

1. Apakah perlu entitas **Profil** (nama, handle, lokasi, bio, status "Working Remotely") di `content/` untuk dipakai NPC/papan di dunia 3D?
2. Apakah **blog/learn/novel** akan tampil di dunia 3D (mis. "perpustakaan guild")? Jika ya, dipindah ke `content/` dengan pembaca terpusat.
3. **Kategori/level skill** (mis. frontend/backend/mobile) tidak ada di data sekarang; dunia 3D mungkin butuh pengelompokan. Tidak saya karang.
4. **`worldStation`**: daftar stasiun dunia 3D (mis. papan quest, bengkel) belum diputuskan; tipe sengaja `string` bebas sampai daftar final ada, lalu sebaiknya diganti union literal.
5. `id: 20` duplikat (`dcc`, `persuratan-iain-parepare`) masih ada; pembaca baru memakai urutan file yang deterministik, tapi urutan yang benar perlu diputuskan.

## Self-review Fase 2

1. Langkah 1–3 tercakup; langkah 4 (ambigu) dicatat di Pertanyaan Terbuka, tidak ditebak.
2. Klaim didukung `diff` HTML, `grep`, dan isi `nft.json`.
3. `git diff` hanya menyentuh konten/pembaca/konsumen; tidak ada perubahan gaya. Diperbaiki saat review: perbandingan HTML pertama tidak valid (server lama masih berjalan setelah file dipindah) → diulang dengan build bersih per branch.
4. Tidak ada `any` baru; semua impor tipe memakai `import type`; tidak ada nilai gaya baru (kelas warna kontak hanya dipindah posisinya dalam file yang sama).
5. type-check, lint, build hijau.
6. Routing belum berubah; semua URL proyek tetap 200 dengan konten sama.
