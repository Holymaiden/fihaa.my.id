import localFont from 'next/font/local';

// Self-hosted (see fonts/SOURCE.md) so builds don't depend on reaching
// Google Fonts. Variable fonts cover the weights used before.

export const jakartaSans = localFont({
  src: './fonts/plus-jakarta-sans-latin-wght-normal.woff2',
  variable: '--jakartaSans-font',
  weight: '200 800',
  display: 'fallback',
});

export const firaCode = localFont({
  src: './fonts/fira-code-latin-wght-normal.woff2',
  variable: '--font-fira-code',
  weight: '300 700',
  display: 'swap',
});

export const soraSans = localFont({
  src: './fonts/sora-latin-wght-normal.woff2',
  variable: '--soraSans-font',
  weight: '100 800',
  display: 'fallback',
});
