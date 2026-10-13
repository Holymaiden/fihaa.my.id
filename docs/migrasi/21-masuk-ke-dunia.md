# Masuk ke Dunia: Musik Otomatis, Transisi Sinematik, Tombol Siang/Malam

Lanjutan `20-air-dan-langit.md`. Permintaan pemilik (2026-10-13):

- musik menyala otomatis saat pertama kali;
- perpindahan dari island ke explore harus terasa seperti benar-benar masuk ke dunianya;
- tombol ganti siang/malam juga ada di 3D, tidak hanya di 2D;
- setelah selesai, langsung merge.

## Batasan browser

Chrome, Safari, dan Firefox **memblokir audio sampai pengunjung berinteraksi** (klik, ketuk, atau tombol). Tidak ada situs yang bisa memutar musik tanpa interaksi apa pun. Referensi pun memakai layar "Start" untuk alasan yang sama. Klik di halaman landing tidak ikut terbawa ke `/world`, karena izin audio dicatat per halaman.

## Yang berubah

**Musik**
- Sound kini **default nyala**. Pilihan "off" diingat di `localStorage` (`world-sound`).
- Mesin audio mulai di dalam gesture pertama, yaitu `pointerdown`, `keydown`, atau `touchend` (`use-world-extras.ts`). Bila halaman sudah pernah diaktifkan, audio langsung mulai.

**Layar masuk** (`world-entrance.tsx`)
- Isi: "Welcome to my world", nama, peran, tombol besar **Enter the world** (fokus otomatis, jadi Enter langsung masuk), dan tautan *Enter without sound*.
- Klik tombol menyalakan musik sekaligus memulai **intro**: kamera berangkat dari jauh di atas lautan awan (`INTRO_VIEW`), lalu meluncur pelan ke tampilan pulau.
- Dock dan label tempat baru muncul setelah masuk. Tur otomatis juga menunggu sampai pengunjung masuk.

**Transisi island → explore** (`store.transition`)

| Momen | Kamera | Layar | Suara |
|---|---|---|---|
| Intro | meluncur dari awan (damping 0,9, ±5 dtk) | kabut tebal yang menipis | *whoosh* + harpa naik |
| Masuk explore | **menukik** dalam busur: maju dan turun, lalu melayang rendah di atas rumput dari belakang titik tujuan, mendarat setinggi mata (3,6 dtk); FOV melebar +16° di titik tercepat | kabut menyapu di tengah tukikan, lalu udara jernih saat mendarat | *whoosh* yang nadanya turun + arpeggio naik saat mendarat |
| Keluar ke island | naik perlahan (damping 1,6) | lintasan kabut singkat | *whoosh* yang nadanya naik |

Semua efek ini mati bila `prefers-reduced-motion` aktif atau tombol efek dimatikan; kamera langsung berpindah.

**Tombol siang/malam di 3D**
- Tombol 🌙/☀️ ada di kontrol kanan atas dan memakai tema situs yang sama (`next-themes`), jadi pilihannya juga berlaku di 2D.
- Kedua ikon selalu dirender, dan CSS menentukan mana yang tampil, supaya markup server dan klien sama.
- Ikon cuaca "cerah" diganti menjadi awan+matahari supaya tidak tertukar dengan tombol ini.

**Penyesuaian kecil:** aurora sedikit diredam, dan halo kristal di malam hari ditipiskan (bloom sudah memberi cahaya).

## Bukti

- `bukti/21-layar-masuk.jpg`: layar masuk, dengan pulau kecil di kejauhan di atas awan
- `bukti/21-intro-kabut.jpg`: intro, kabut menipis saat kamera mendekati pulau
- `bukti/21-malam-aurora.jpg`: setelah menekan tombol malam di 3D

## Hasil cek

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau. Console bersih.
- Alur yang diuji dengan Playwright: layar masuk → Enter → intro → Explore → tombol malam.
