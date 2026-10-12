# Label Melayang, Kartu, dan Dock

Branch: `claude/clever-albattani-e7tn9x` (PR Holymaiden/fihaa.my.id#216). Umpan balik pemilik: kotak navigasi dan panel yang muncul saat diklik masih kurang bagus. Diminta: saat diklik kamera zoom, lalu di tempat itu tertulis Profile, Projects, dan lainnya.

## Yang berubah

| Sebelum | Sesudah |
|---|---|
| Daftar tombol kotak di kiri layar | **Label melayang** di atas tiap tempat di pulau (ikon + nama: Profile, Projects, Skills, Experience, Contact). Label di sisi belakang pulau memudar otomatis. |
| Klik → panel samping penuh | Klik → **kamera zoom** ke tempat itu dan **kartu info muncul di sebelahnya** (callout dengan titik dan garis), berisi ringkasan dan tombol **View details**. Panel lengkap baru muncul setelah tombol itu ditekan. |
| Tombol ← → polos dan teks petunjuk | **Dock** kaca di bawah: ‹ · nama tempat sekarang / "All places" · ›. Tombol tengah membuka menu semua tempat. |
| Tombol teks "Effects: on" dan "Credits" | Tombol ikon bulat (✦ efek, ⓘ kredit) di kanan atas; "Switch to 2D" jadi pil kaca dengan ikon. |
| Kastel hanya hiasan | Kastel = stasiun **Profile** ("About me"): peran, lokasi, perkenalan; detailnya cerita lengkap dari `content/profile.ts`. |

Isi kartu per tempat (komponen `station-teaser.tsx`, semua dari data konten):
- **Profile**: peran · lokasi, paragraf perkenalan pertama
- **Projects**: 3 proyek terbaru
- **Skills**: cabang skill + jumlahnya
- **Experience**: posisi saat ini + periode
- **Contact**: tombol ikon langsung ke email, LinkedIn, Facebook, Instagram, GitHub, dan resume
- **Hidden Vault**: 3 proyek pilihan

Di HP dan saat scene 3D tidak tersedia (tanpa WebGL atau error), kartu tampil sebagai **sheet di bawah**, di atas dock. Kamera menggeser tempat ke atas.

Bukti:
- `bukti/18-malam.jpg` dan `bukti/18-siang.jpg`: pulau dengan label, kartu Projects, panel detail, Profile, Skills, Hidden Vault
- `bukti/18-hp.jpg`: label di HP dan kartu sheet malam/siang
- `bukti/18-fallback.png`: tanpa WebGL, kartu dan panel tetap jalan

## Detail teknis

- Label dan kartu memakai drei `<Html>` di dalam `IslandRig`, jadi ikut berputar bersama pulau. `zIndexRange` dibatasi (label 10–12, kartu 13–15) supaya tetap di bawah panel detail (z-30) dan dialog kredit.
- **Aksesibilitas**: `aria-hidden` dipindah dari wrapper Canvas ke elemen `<canvas>` saja. Sebelumnya `Html` ikut berada di dalam subtree yang tersembunyi, sehingga kartu tidak terbaca pembaca layar (ditemukan saat uji Playwright). Label di pulau `tabIndex=-1`; jalur keyboard lewat dock (‹ menu ›) dan panah ← →.
- **Fokus**: buka tempat → judul kartu; View details → judul panel; Esc → kembali ke kartu; Esc lagi → tombol menu dock. Diuji:

```
label click -> focus world-card-title
details     -> focus world-panel-title
esc1        -> focus world-card-title
esc2        -> focus All places
```

- ← → kini melewati Profile → Projects → Skills → Experience → Contact (`TURN_ORDER`). Drag tetap snap ke empat stasiun di tepi pulau.
- Kamera: shot baru `PROFILE_VIEW`. Saat sebuah tempat terbuka, kamera digeser (desktop +5,5 x, HP −3,4 y) supaya tempat dan kartunya sama-sama terlihat. Jangkar kartu berada 3 unit di kanan tempat, dalam bingkai tempat itu (`cardAnchor`), jadi tidak menutupi objeknya.
- Store: `detailsOpen`, `openDetails`, `closeDetails`; membuka atau menutup tempat juga menutup detail.
- Teks UI baru (`viewDetails`, `closeCard`, `placesMenu`, `latest`, `now`) dan field stasiun baru (`place`) ada di `content/world.ts`; label stasiun memakai kata biasa.

## Hasil cek

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau.
- Isolasi three (chunk `3mdrnszzzlk4-.js`, 1.023.424 B / gzip 273.922 B): `/`, `/2d`, `/2d/about`, `/2d/projects`, `/2d/contact` → **tidak**; `/world` → ya.
- Tanpa WebGL: pesan fallback, tanpa chunk three/GLB, tanpa tombol efek; kartu (sheet) dan panel detail berfungsi. `core.glb` gagal dimuat → error boundary, kartu tampil sebagai sheet.
- Beban render tidak berubah: pulau 72 draw call / 75 rb segitiga, karena label dan kartu adalah HTML, bukan geometri. Idle dengan efek mati tetap 0 draw call. Angka mentah: `bukti/18-pengukuran.txt`.

## Pertanyaan Terbuka

1. Label Hidden Vault sengaja tidak ditampilkan di pulau (tetap rahasia); vault bisa dibuka dari menu dock. Perlu petunjuk lain?
2. Bila ingin label berbahasa Indonesia (mis. "Profil", "Proyek"), cukup ubah `content/world.ts`.

## Self-review

1. Permintaan terpenuhi: zoom saat diklik, nama tempat tertulis di lokasinya, dan kartu muncul di tempat itu.
2. Navigasi kotak lama diganti label + dock; aksesibilitas keyboard dan pembaca layar tetap (bahkan diperbaiki).
3. Semua teks dari konten; warna dari token (`accent`, `light`, `dark`); tidak ada `any`.
4. type-check, lint, build hijau; `/` dan `/2d/*` bebas three; fallback diuji ulang.
