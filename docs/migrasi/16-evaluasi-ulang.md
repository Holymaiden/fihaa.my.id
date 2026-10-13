# Evaluasi Ulang Dunia 3D (umpan balik pemilik, 2026-10-12)

Umpan balik: tampilan `/world` dinilai jelek dan tidak halus, dan konsep banyak pulau melayang membingungkan. Referensi pemilik: https://github.com/basedhound/3d-island_portfolio_react. Sumber aset yang disarankan: Sketchfab dan "Pascal Editor".

Jawaban pemilik atas pertanyaan lanjutan:

| Topik | Jawaban |
|---|---|
| Konsep | **Satu pulau diputar** (drag/tombol; tiap sisi pulau = satu stasiun) |
| Sumber model | Pulau buatan seniman, bukan Fox's islands, dari tempat **gratis** |
| "Pascal editor" | Repo GitHub |

## Analisis repo referensi

- Basisnya tutorial JS Mastery "3D Portfolio" (React 18, R3F 8, drei 9, Vite).
- Pulau adalah **satu model utuh** `island.glb` (356 KB, Draco + WebP), dengan metadata *Fox's islands* oleh nimzu (Sketchfab, **CC-BY-4.0**). Model lain juga CC-BY-4.0 dari Sketchfab: pesawat (1,47 MB), burung (1,63 MB), langit (329 KB), rubah (104 KB).
- Interaksi: pulau diputar dengan drag/panah. Sudut putaran menentukan "stage" 1–4, lalu kotak info HTML muncul. Pesawat diam di depan kamera. Ada musik opsional.
- Model pulau itu ternyata juga **low-poly**. Kesan "halus" datang dari tiga hal: (1) satu komposisi utuh buatan satu seniman, (2) kamera dekat dan pulau memenuhi layar, (3) cahaya lembut. Detail poligon bukan penyebab utamanya.
- `Fox's islands` sudah dipakai di sangat banyak portofolio hasil tutorial yang sama, jadi memakainya akan terlihat seperti klon.

## Sumber aset

| Sumber | Status dari sandbox | Catatan |
|---|---|---|
| Sketchfab | **diblokir** (`sketchfab.com`, `api.sketchfab.com` gagal terhubung) | Unduhan juga butuh akun; lisensi bervariasi (banyak CC-BY, wajib kredit). |
| itch.io kreator lain (mis. `hakanbacon.itch.io/floating-islands`) | **diblokir** (hanya `quaternius.itch.io` dan `itch.io` yang terbuka) | Lisensi belum bisa diperiksa. |
| OpenGameArt / Poly Pizza | 500 / 403 | — |
| Quaternius Ultimate Platformer Pack | diunduh (CC0) dan diperiksa | Gaya platformer ala Mario (kubus, pipa, koin); tidak cocok. |
| **Pascal Editor** (`pascalorg/editor`) | dibaca dari GitHub | Lisensi MIT. Editor **bangunan arsitektur** (dinding, ruangan, atap, perabot) berbasis R3F + WebGPU, bisa ekspor GLB. **Tidak cocok untuk pulau/terrain organik**; paling jauh bisa dipakai untuk satu bangunan. Tidak dipakai untuk pulau. |

## Prototipe: satu pulau organik + aset CC0 yang sudah ada

Untuk membuktikan bahwa yang dibutuhkan adalah komposisi dan cahaya, saya membuat prototipe statis (bukan kode situs):
- satu pulau dengan permukaan halus berbukit, dibuat prosedural (vertex color rumput → pasir → tebing → batu, smooth normal);
- bangunan KayKit dan pohon Quaternius yang sama seperti sebelumnya;
- bayangan lembut (PCF soft shadow), langit gradien, dan awan.

Hasilnya ada di `bukti/16-prototipe-satu-pulau.jpg` (dua sudut putaran). Perbandingan dengan referensi ada di `bukti/16-referensi-vs-sekarang.jpg`.

## Usulan langkah berikutnya (menunggu persetujuan)

1. Ganti scene: **satu pulau organik halus** (prosedural, 0 KB aset tambahan) + bangunan/pohon CC0. Stasiun ditempatkan di empat sisi pulau, Hidden Vault di gua di bawah pulau.
2. Navigasi: drag/geser untuk memutar pulau, tombol ← → dan keyboard, daftar stasiun HTML tetap ada. Saat sisi stasiun menghadap kamera, panelnya terbuka. Klik juga tetap bisa.
3. Pencahayaan: bayangan lembut (dimatikan otomatis di HP lemah lewat `PerformanceMonitor`), palet siang/malam tetap dari token.
4. Opsional, setelah ini berjalan: satu "hero model" CC-BY dari Sketchfab untuk landmark, bila pemilik mengunduhnya manual atau membuka domain Sketchfab di environment.
