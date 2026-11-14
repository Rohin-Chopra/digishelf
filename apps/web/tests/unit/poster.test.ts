import { describe, expect, it } from "vitest";
import { posterSrcSet, posterUrl } from "@/lib/poster";

describe("posterUrl", () => {
  it("picks the smallest TMDB size that covers the width", () => {
    expect(posterUrl("/a.jpg", 300)).toBe(
      "https://image.tmdb.org/t/p/w342/a.jpg",
    );
    expect(posterUrl("/a.jpg", 92)).toBe(
      "https://image.tmdb.org/t/p/w92/a.jpg",
    );
  });

  it("caps large widths at w780", () => {
    expect(posterUrl("/a.jpg", 1920)).toBe(
      "https://image.tmdb.org/t/p/w780/a.jpg",
    );
  });

  it("lists every size in the srcset", () => {
    expect(posterSrcSet("/a.jpg").split(", ")).toHaveLength(6);
    expect(posterSrcSet("/a.jpg")).toContain(
      "https://image.tmdb.org/t/p/w780/a.jpg 780w",
    );
  });
});
