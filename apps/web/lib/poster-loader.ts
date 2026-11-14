import type { ImageLoaderProps } from "next/image";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const POSTER_WIDTHS = [92, 154, 185, 342, 500, 780] as const;
const LARGEST_WIDTH = POSTER_WIDTHS[POSTER_WIDTHS.length - 1];

// Posters never render wider than ~400 CSS px, so cap at w780 rather than
// pulling multi-megabyte "original" files for large srcset candidates.
export function posterLoader({ src, width }: ImageLoaderProps): string {
  const size = POSTER_WIDTHS.find((w) => w >= width) ?? LARGEST_WIDTH;
  return `${TMDB_IMAGE_BASE_URL}/w${size}${src}`;
}
