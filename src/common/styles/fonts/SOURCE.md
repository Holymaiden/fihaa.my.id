# Self-hosted fonts

Fonts are bundled with the app (`next/font/local`) so builds don't need to reach Google Fonts.
Turbopack builds failed when `next/font/google` could not download the fonts ("Can't resolve" on the
font module).

| File | Family | Weights | Source | License |
|---|---|---|---|---|
| `plus-jakarta-sans-latin-wght-normal.woff2` | Plus Jakarta Sans (variable) | 200–800 | npm `@fontsource-variable/plus-jakarta-sans@5.3.0` | SIL OFL 1.1 (`LICENSE-plus-jakarta-sans.txt`) |
| `sora-latin-wght-normal.woff2` | Sora (variable) | 100–800 | npm `@fontsource-variable/sora@5.3.0` | SIL OFL 1.1 (`LICENSE-sora.txt`) |
| `fira-code-latin-wght-normal.woff2` | Fira Code (variable) | 300–700 | npm `@fontsource-variable/fira-code@5.3.0` | SIL OFL 1.1 (`LICENSE-fira-code.txt`) |

Same Latin subset as the previous `next/font/google` setup (`subsets: ['latin']`), normal style only.
