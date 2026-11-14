import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/search/route";
import type * as tmdb from "@/lib/tmdb";
import { searchTitles, TmdbConfigError, TmdbRequestError } from "@/lib/tmdb";

vi.mock("@/lib/tmdb", async (importOriginal) => ({
  ...(await importOriginal<typeof tmdb>()),
  searchTitles: vi.fn(),
}));

const search = vi.mocked(searchTitles);

function get(q?: string) {
  const url = new URL("http://localhost/api/search");
  if (q !== undefined) url.searchParams.set("q", q);
  return GET(new NextRequest(url));
}

describe("GET /api/search", () => {
  afterEach(() => search.mockReset());

  it("returns no results for an empty query without calling TMDB", async () => {
    const response = await get("   ");
    expect(await response.json()).toEqual({ results: [] });
    expect(search).not.toHaveBeenCalled();
  });

  it("rejects overly long queries", async () => {
    const response = await get("a".repeat(101));
    expect(response.status).toBe(400);
  });

  it("returns trimmed-query results", async () => {
    search.mockResolvedValue([
      {
        id: 1,
        mediaType: "movie",
        name: "Up",
        year: 2009,
        posterPath: null,
        overview: "",
      },
    ]);
    const response = await get("  up ");
    expect(search).toHaveBeenCalledWith("up");
    expect(response.status).toBe(200);
    expect((await response.json()).results).toHaveLength(1);
  });

  it("returns 503 when TMDB is not configured", async () => {
    search.mockRejectedValue(new TmdbConfigError("missing"));
    expect((await get("up")).status).toBe(503);
  });

  it("returns 502 when TMDB fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    search.mockRejectedValue(new TmdbRequestError(500));
    expect((await get("up")).status).toBe(502);
  });
});
