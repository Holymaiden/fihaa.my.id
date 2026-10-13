# Fase 9 — Visual

Branch: `claude/clever-albattani-e7tn9x` (PR Holymaiden/fihaa.my.id#216).

## Ringkasan

- Gaya **flat color**: Canvas memakai `flat` (tanpa tone mapping), material Quaternius diwarnai dari palet, dan atlas KayKit dipakai apa adanya.
- **Palet diserahkan ke saya** ("yang penting baik dilihat"). Saya memakai dua suasana yang mengikuti tema situs:
  - tema terang → **siang**: langit biru ke peach, rumput hijau segar, batu cokelat hangat
  - tema gelap (default situs) → **malam**: langit biru tua ke ungu-indigo, cahaya bulan kebiruan

  Aksen stasiun tetap teal situs (`--color-accent`), jadi 2D dan 3D terasa satu keluarga.
- Langit adalah gradien prosedural tiga warna (shader, 0 KB). Pencahayaan murah: 1 hemisphere + 1 directional, tanpa bayangan. Kabut linear dipakai untuk kedalaman.
- **Misteri hanya di Hidden Vault**: petak ungu gelap, kristal bercahaya berdenyut, lampu titik teal, dan partikel melayang. Pulau lain tetap cerah.
- Efek gerak (awan berputar pelan, kristal berputar/berdenyut, partikel, animasi terbang kamera) bisa **dimatikan** dengan tombol "Effects: on/off" (pilihan disimpan di `localStorage`). Efek **mati otomatis** untuk `prefers-reduced-motion`.
- Konfigurasi terpusat:
  - **warna**: token `--color-world-*` di `src/common/styles/globals.css`
  - **selain warna**: `src/modules/world/config/visual.ts` (cahaya, kabut, langit, efek, pemetaan material → token)
- Bukti: `bukti/13-siang.jpg`, `bukti/13-malam.jpg` (pulau, Quest Board, Hidden Vault, Skill Tree), `bukti/13-siang-hp.jpg`, `bukti/13-malam-hp.jpg` (390 px).

## Token (Fase 5 + token semantik baru)

Semua warna 3D dibaca dari CSS lewat `useWorldPalette()`. Hook ini berlangganan perubahan class `<html>` (MutationObserver), jadi mengganti tema di 2D langsung mengubah dunia 3D. Token yang memakai ulang token Fase 5: `--color-world-station-active` dan `--color-world-skill-node` = `var(--color-accent)`, `--color-world-crystal-glow` = `var(--color-loader)`.

| Token | Siang | Malam | Dipakai untuk |
|---|---|---|---|
| `sky-top` / `sky-horizon` / `sky-bottom` | `#79bde8` / `#fbe3c4` / `#b9cde6` | `#0d1733` / `#3b4778` / `#151c33` | gradien langit, warna langit hemisphere |
| `fog` | `#e6dfd2` | `#2a3256` | kabut |
| `sun` | `#fff2dc` | `#c9d5ff` | directional light (matahari/bulan) |
| `ground-light` | `#7d8aa0` | `#222a44` | warna bawah hemisphere |
| `island-side` | `#8a7462` | `#4f4558` | kerucut batu di bawah pulau |
| `grass-tint` | `#b4e3a4` | `#9fd0a4` | tint per-instance di atas rumput KayKit (aslinya zaitun) |
| `foliage` / `trunk` / `rock` / `berry` / `flower-a` / `flower-b` | `#5ea35b` / `#7a5236` / `#a3a8ad` / `#d65a4f` / `#7fd8e8` / `#f2c94c` | foliage & trunk & rock lebih gelap | material Quaternius (lewat akhiran nama material) |
| `wood` / `paper` / `mailbox` | `#8b5a3c` / `#f3ead2` / `#c0503f` | sama | papan quest, catatan, kotak surat |
| `station-hover` / `station-active` | `#ffffff` / aksen | `#e8ecff` / aksen | cincin seleksi heksagonal |
| `crystal` / `crystal-glow` | `#8ee8f2` / `var(--color-loader)` | sama | kristal vault, lampu, partikel |
| `secret` / `secret-tile` | `#3a3352` / `#6d6390` | sama | batu dan petak Hidden Vault |

Token greybox Fase 7 (`island-top`, `station`, `guild`) dihapus karena tidak dipakai lagi.

## Keputusan teknis

| Topik | Keputusan |
|---|---|
| Flat color | `<Canvas flat>` = `NoToneMapping`; tanpa itu ACES menggeser warna atlas KayKit. Material Quaternius diwarnai ulang oleh `KitRecolor` berdasarkan akhiran nama (`_Green`, `_Wood`, `_Rock`, `_Berry`, `_Cyan`, `_Yellow`; pemetaan di `MATERIAL_RECOLOR`). Material dibagi oleh Clone/instancing, jadi satu kali set berlaku untuk semua salinan. |
| Rumput | Atlas KayKit berwarna zaitun. Ditambah tint per-instance (`InstancedMesh.setColorAt`) pada petak hex: hijau di pulau biasa, ungu di vault. Tanpa tekstur baru dan tanpa draw call tambahan. |
| Langit | `SkyDome`: bola `BackSide` + `ShaderMaterial` (3 warna, `colorspace_fragment`), `depthWrite=false`, tanpa kabut. |
| Kabut | linear, near 90 / far 260. Nilai awal 45/140 membuat tampilan HP (kamera ±100 unit) tertutup kabut. Ditemukan dari screenshot 390 px dan diperbaiki. |
| Cahaya | hemisphere (horizon → ground) + directional; intensitas siang 1,5/1,7, malam 1,2/0,9 (`VISUAL.light`). Tanpa bayangan (anggaran HP). |
| Vault | `VaultMood`: kristal emissive + `pointLight` (intensitas 18, jarak 9) + drei `<Sparkles>` 40 partikel (hanya bila efek aktif). |
| Efek | `useEffectsEnabled()` = pilihan pengunjung ?? `!prefers-reduced-motion`. Dipakai oleh awan (`WorldClouds`), kristal, partikel, dan animasi kamera (`CameraRig`). |

API yang dipakai dicek dari `.d.ts` versi terpasang: drei `Sparkles` (`core/Sparkles.d.ts`), `InstancedMesh.setColorAt` (`@types/three`), dan prop `flat` di Canvas R3F 9.

## Uji

- Screenshot siang/malam di desktop 1280×800 dan HP 390×780 (Chromium + SwiftShader).
- Reduced motion (Playwright `reducedMotion: 'reduce'`):

```
reduced motion -> Effects: off
after toggle   -> Effects: on   (localStorage world-effects = on)
after reload   -> Effects: on
tanpa reduce   -> Effects: on
```

- `yarn type-check` hijau · `yarn lint` 0 masalah · `yarn build` hijau.
- Isolasi three (chunk `0wt754p67q5-_.js`, 1.054.392 B / gzip 278.818 B; +7 KB karena Sparkles dan shader langit): `/`, `/2d`, `/2d/about`, `/2d/projects`, `/2d/contact` → **tidak**; `/world` → ya.

## Pertanyaan Terbuka

1. Palet adalah pilihan saya. Bila ingin suasana lain (mis. senja permanen), cukup ubah nilai `--color-world-*` di `globals.css`, tanpa menyentuh kode.
2. Kristal vault dan cahayanya terlihat samar dari tampilan pulau (titik teal di bawah guild), sebagai petunjuk ruang rahasia. Bisa disembunyikan bila diinginkan.

## Self-review Fase 9

1. Flat color tercapai: tanpa tone mapping, tanpa tekstur baru, palet hanya dari token.
2. Langit gradien prosedural, cahaya murah tanpa bayangan, kabut ringan.
3. Efek bisa dimatikan, mengikuti `prefers-reduced-motion`, dan pilihan diingat (dengan try/catch untuk storage).
4. Nuansa misterius hanya muncul di Hidden Vault (petak, batu, kristal, lampu, partikel).
5. Konfigurasi visual terpusat (`globals.css` + `config/visual.ts`); token Fase 5 dipakai ulang untuk aksen.
6. Ditemukan saat uji dan diperbaiki: rumput zaitun (tint), tampilan HP tertutup kabut (jarak kabut), dan stasiun di HP terlalu rendah (focal offset 3 → 4,5).
7. type-check, lint, build hijau; `/` dan `/2d/*` bebas three.
