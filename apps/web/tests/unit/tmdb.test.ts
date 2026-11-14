import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  searchTitles,
  TmdbConfigError,
  TmdbRequestError,
  toTitle,
} from "@/lib/tmdb";

describe("toTitle", () => {
  it("maps a movie", () => {
    expect(
      toTitle({
        id: 603,
        media_type: "movie",
        title: "The Matrix",
        release_date: "1999-03-31",
        poster_path: "/matrix.jpg",
        overview: "Neo wakes up.",
      }),
    ).toEqual({
      id: 603,
      mediaType: "movie",
      name: "The Matrix",
      year: 1999,
      posterPath: "/matrix.jpg",
      overview: "Neo wakes up.",
    });
  });

  it("maps a TV show using name and first_air_date", () => {
    expect(
      toTitle({
        id: 1396,
        media_type: "tv",
        name: "Breaking Bad",
        first_air_date: "2008-01-20",
      }),
    ).toMatchObject({
      mediaType: "tv",
      name: "Breaking Bad",
      year: 2008,
      posterPath: null,
    });
  });

  it("drops people and titles without a name", () => {
    expect(
      toTitle({ id: 1, media_type: "person", name: "Keanu Reeves" }),
    ).toBeNull();
    expect(toTitle({ id: 2, media_type: "movie" })).toBeNull();
  });

  it("handles missing or empty dates", () => {
    expect(
      toTitle({
        id: 3,
        media_type: "movie",
        title: "Untitled",
        release_date: "",
      })?.year,
    ).toBeNull();
  });
});

describe("searchTitles", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(
      Response.json({
        results: [
          {
            id: 603,
            media_type: "movie",
            title: "The Matrix",
            release_date: "1999-03-31",
          },
          { id: 6384, media_type: "person", name: "Keanu Reeves" },
        ],
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    fetchMock.mockReset();
  });

  it("throws a config error when no key is set", async () => {
    vi.stubEnv("TMDB_API_KEY", "");
    await expect(searchTitles("matrix")).rejects.toBeInstanceOf(
      TmdbConfigError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a v4 read token as a bearer header", async () => {
    vi.stubEnv("TMDB_API_KEY", "eyJhbGciOiJIUzI1NiJ9.token");
    const results = await searchTitles("matrix");

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toContain(
      "https://api.themoviedb.org/3/search/multi?",
    );
    expect(url.searchParams.get("query")).toBe("matrix");
    expect(url.searchParams.get("include_adult")).toBe("false");
    expect(url.searchParams.has("api_key")).toBe(false);
    expect(init.headers).toMatchObject({
      authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.token",
    });
    expect(results.map((r) => r.name)).toEqual(["The Matrix"]);
  });

  it("sends a v3 key as a query param and honours TMDB_API_BASE_URL", async () => {
    vi.stubEnv("TMDB_API_KEY", "abc123");
    vi.stubEnv("TMDB_API_BASE_URL", "http://localhost:4010/3/");
    await searchTitles("matrix");

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.origin + url.pathname).toBe(
      "http://localhost:4010/3/search/multi",
    );
    expect(url.searchParams.get("api_key")).toBe("abc123");
    expect(init.headers).not.toHaveProperty("authorization");
  });

  it("throws a request error on a non-2xx response", async () => {
    vi.stubEnv("TMDB_API_KEY", "abc123");
    fetchMock.mockResolvedValue(new Response("nope", { status: 401 }));
    await expect(searchTitles("matrix")).rejects.toEqual(
      new TmdbRequestError(401),
    );
  });

  it("wraps network failures in a request error", async () => {
    vi.stubEnv("TMDB_API_KEY", "abc123");
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await expect(searchTitles("matrix")).rejects.toBeInstanceOf(
      TmdbRequestError,
    );
  });

  it.each([
    ["invalid JSON", "<html>oops</html>"],
    ["a body without results", JSON.stringify({ status_code: 7 })],
  ])("throws a request error on %s", async (_, body) => {
    vi.stubEnv("TMDB_API_KEY", "abc123");
    fetchMock.mockResolvedValue(new Response(body, { status: 200 }));
    await expect(searchTitles("matrix")).rejects.toBeInstanceOf(
      TmdbRequestError,
    );
  });
});
