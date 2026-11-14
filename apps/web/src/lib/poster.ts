const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
// Posters never render wider than ~400 CSS px, so stop at w780 rather than "original".
const POSTER_WIDTHS = [92, 154, 185, 342, 500, 780] as const;

export function posterUrl(path: string, width: number): string {
  const size = POSTER_WIDTHS.find((w) => w >= width) ?? POSTER_WIDTHS.at(-1)!;
  return `${TMDB_IMAGE_BASE_URL}/w${size}${path}`;
}

export function posterSrcSet(path: string): string {
  return POSTER_WIDTHS.map((w) => `${posterUrl(path, w)} ${w}w`).join(", ");
}
