import { describe, expect, it } from "vitest";
import { posterLoader } from "@/lib/poster-loader";

describe("posterLoader", () => {
  it("picks the smallest TMDB size that covers the requested width", () => {
    expect(posterLoader({ src: "/a.jpg", width: 300 })).toBe(
      "https://image.tmdb.org/t/p/w342/a.jpg",
    );
    expect(posterLoader({ src: "/a.jpg", width: 92 })).toBe(
      "https://image.tmdb.org/t/p/w92/a.jpg",
    );
  });

  it("caps large widths at w780", () => {
    expect(posterLoader({ src: "/a.jpg", width: 1920 })).toBe(
      "https://image.tmdb.org/t/p/w780/a.jpg",
    );
  });
});
