# Keputusan Dunia 3D

Dicatat 2026-10-12 dari jawaban pemilik, ditulis apa adanya. Bagian yang belum diisi ditandai **BELUM DIISI**, tidak diisi sendiri.

## Keputusan

| # | Topik | Keputusan pemilik |
|---|---|---|
| 1 | Gaya visual | **Low-poly flat color** |
| 2 | Palet & suasana | **BELUM DIISI**. Jawaban masih berupa templat: "siang cerah / senja / campuran; 4-6 warna utama + warna aksen". |
| 3 | Navigasi | **Kamera terbang ke stasiun saat diklik** |
| 4 | Stasiun & isinya | Papan Quest → Proyek · Skill Tree → Skill · Jurnal Perjalanan → Pengalaman · Kedai/Kotak Surat → Kontak · Ruangan rahasia (nuansa misterius) → proyek unggulan |
| 5 | Perangkat target & anggaran | 60 fps di laptop menengah, minimal 30 fps di HP menengah; total aset 3D awal (setelah kompresi) ≤ 10 MB |

## Keputusan proses

- Semua PR terbuka selain Holymaiden/fihaa.my.id#216 ditutup: 8 PR Depfu (#159, #163, #197, #202, #212, #213, #214, #215). Versi yang mereka tawarkan sudah ada di `package.json` branch ini.
- Semua pekerjaan memakai branch `claude/clever-albattani-e7tn9x` (PR Holymaiden/fihaa.my.id#216). Aturan "satu branch per fase" diganti oleh keputusan ini; fase dibedakan lewat commit dan laporan.
- Laporan dinomori ulang mulai 09, karena 06–08 sudah terpakai:

| Fase di tugas | Laporan |
|---|---|
| Keputusan dunia | `09-keputusan-dunia.md` (file ini) |
| 6 Aset | `10-aset.md` + `ASSETS.md` |
| 7 Greybox | `11-greybox.md` |
| 8 Integrasi aset | `12-integrasi-aset.md` |
| 9 Visual | `13-visual.md` |
| 10 Rilis | `14-rilis.md` |
| Laporan akhir | `15-ringkasan-3d.md` |

## Catatan dan dampak

- **Karakter (VRoid/Mixamo)** tidak disebut. Saya anggap *tidak dipakai di tahap ini*, karena tugas menyebutnya "opsional, tahap lanjutan" dan navigasi memakai kamera terbang, bukan karakter berjalan.
- **Palet (no. 2)** memblokir Fase 9 (warna akhir) dan token `station-*`. Untuk Fase 6 dampaknya kecil: aset flat color di-recolor lewat material/atlas, jadi pilihan paket tidak bergantung pada palet. Sebelumnya (`06-tindak-lanjut.md` baris 12) arah visual diputuskan "bebas, menyesuaikan pulau nanti"; opsi palet ada di `05-token.md`.
- **Stasiun di kode**: `WorldStationId` di `src/lib/content/types.ts:8` baru punya `projects | skills | experience | contact`. Ruangan rahasia perlu id kelima, ditambahkan di Fase 7.
- **"Proyek unggulan"**: field `is_featured` sudah ada, tetapi bernilai `true` di 17 dari 25 proyek di `content/projects/`. Kalau ruangan rahasia memakai field ini, isinya hampir sama dengan Papan Quest. Ini dicatat sebagai pertanyaan terbuka di `10-aset.md`.
