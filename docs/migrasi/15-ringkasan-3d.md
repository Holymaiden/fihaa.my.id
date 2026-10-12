# Ringkasan Dunia 3D (Fase 6–10)

Branch: `claude/clever-albattani-e7tn9x` · PR Holymaiden/fihaa.my.id#216 · tidak di-merge, tidak di-deploy.

## Apa yang sudah jadi

`/world` adalah portofolio dalam bentuk pulau melayang low-poly flat color. Di tengahnya ada **kastel guild**, dikelilingi lima stasiun. Klik/ketuk stasiun (atau pakai daftar HTML/keyboard) dan kamera terbang ke sana sambil membuka panel konten:

| Stasiun | Isi | Sumber data |
|---|---|---|
| Quest Board | 25 proyek (1 catatan di papan per proyek, maks. 12) | `content/projects/*.mdx` via `getProjects` |
| Skill Tree | skill per 6 kategori (1 simpul bercahaya per kategori) | `content/skills.ts` |
| Travel Journal | karier, pendidikan, organisasi | `content/experience.ts` |
| Tavern Mailbox | email, sosial, resume | `content/contact.ts` |
| Hidden Vault (di bawah pulau guild) | 3 proyek pilihan: featured + demo publik, terbaru | `getVaultProjects` |

- Suasana **siang** (tema terang) dan **malam** (tema gelap, default situs). Misteri hanya ada di Hidden Vault.
- Efek gerak bisa dimatikan dan mengikuti `prefers-reduced-motion`.
- Tanpa WebGL atau saat terjadi error: muncul pesan + tombol ke 2D, dan panel HTML tetap bisa dipakai.
- `/` dan `/2d/*` **tidak** memuat three.js (dibuktikan dengan uji runtime di setiap fase).

## Angka utama

| Metrik | Nilai | Anggaran |
|---|---|---|
| Aset 3D | 0,70 MB (gzip 0,45 MB), 32 model dalam 2 kit; vault lazy | ≤ 10 MB |
| JS `/world` | 1,84 MB mentah / 0,53 MB gzip (three 0,28 MB gzip, lazy) | — |
| Draw call / segitiga (pulau) | 78 / 42,8 rb | — |
| Aset siap | 0,8 dtk desktop · 3,4 dtk HP diemulasi (CPU 4×, ±1 Mbps) | — |
| fps | **belum terukur di perangkat nyata** (sandbox tanpa GPU) | 60 laptop · ≥ 30 HP |

## Laporan per fase

| Fase | Laporan | Inti |
|---|---|---|
| 6 Aset | `10-aset.md`, `ASSETS.md` | KayKit (utama) + Quaternius Ultimate Nature (alam). MegaKit ditolak karena bertekstur. Disetujui pemilik. |
| 7 Greybox | `11-greybox.md` | 5 stasiun + guild, CameraControls, panel HTML dari pembaca konten, id `secret`, keyboard. |
| 8 Integrasi aset | `12-integrasi-aset.md` | Pipeline gltf-transform + meshopt + tipe gltfjsx, instancing, lazy vault, kredit otomatis. |
| 9 Visual | `13-visual.md` | Palet token siang/malam, langit gradien, cahaya murah, efek bisa dimatikan. |
| 10 Rilis | `14-rilis.md` | Pengukuran, DPR adaptif, render on-demand, fallback/error boundary, metadata/OG/sitemap, checklist. |

## Cara mengubah tanpa menyentuh komponen 3D

| Ingin mengubah… | Ubah di |
|---|---|
| Nama/teks stasiun, teks UI, ukuran vault | `content/world.ts` |
| Isi proyek/skill/pengalaman/kontak | `content/*` (sama dengan situs 2D) |
| Warna dunia (siang/malam) | token `--color-world-*` di `src/common/styles/globals.css` |
| Cahaya, kabut, efek, dpr | `src/modules/world/config/visual.ts` |
| Posisi pulau dan kamera | `src/modules/world/config/layout.ts` |
| Penempatan model | `src/modules/world/config/props.ts` |
| Menambah/mengganti model | `content/world-assets.json` → `yarn world:assets` (kredit ikut otomatis) |

## Yang perlu dari pemilik

1. Jalankan **checklist rilis manual** di `14-rilis.md`, terutama fps di laptop dan HP lewat `/world?debug=stats`.
2. Review dan merge PR Holymaiden/fihaa.my.id#216 bila checklist lolos.
3. Opsional: konfirmasi palet, posisi vault yang samar-samar terlihat, dan teks UI berbahasa Inggris (detail di "Pertanyaan Terbuka" `11`–`14`).

## Risiko yang diketahui

- React 19.4 belum didukung `@react-three/fiber` 9.8 (peer `<19.4`); jangan naikkan React sebelum fiber memperluas rentangnya (dari `04-r3f.md`).
- Peringatan `THREE.Clock` deprecated berasal dari R3F, bukan dari kode kita.
- Angka fps sandbox (SwiftShader) tidak boleh dijadikan acuan.

## Self-review akhir

1. Semua fase 6–10 punya laporan dengan self-review. Setiap fase lolos type-check, lint, build, dan uji isolasi three.
2. Tidak ada teks konten di komponen 3D, warna berasal dari token, `import type` dipakai, nama berkas kebab-case, tanpa `any` baru.
3. Klaim yang tidak bisa diukur di sandbox (fps nyata) dinyatakan terbuka dan dipindahkan ke checklist manual.
4. Lisensi: semua 32 model CC0, tercatat di `ASSETS.md` dan dikreditkan otomatis di `/world`.
5. Tidak ada push ke `main`, merge, deploy, perubahan Vercel, atau tampilan `.env`.
