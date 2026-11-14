import { afterEach, describe, expect, it, vi } from "vitest";
import { searchTitles } from "@/lib/graphql";

function respond(status: number, body: unknown) {
  const fetch = vi.fn().mockResolvedValue(
    new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status,
    }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => vi.unstubAllGlobals());

describe("searchTitles", () => {
  it("posts the query and maps media types", async () => {
    const fetch = respond(200, {
      data: {
        search: [
          {
            id: 1396,
            mediaType: "TV",
            name: "Breaking Bad",
            year: 2008,
            posterPath: null,
            overview: "",
          },
          {
            id: 603,
            mediaType: "MOVIE",
            name: "The Matrix",
            year: 1999,
            posterPath: "/m.jpg",
            overview: "",
          },
        ],
      },
    });
    const titles = await searchTitles("b");
    expect(titles.map((t) => t.mediaType)).toEqual(["tv", "movie"]);
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("/graphql");
    expect(JSON.parse(init.body).variables).toEqual({ query: "b" });
  });

  it("surfaces the API's error message", async () => {
    respond(200, {
      data: null,
      errors: [{ message: "Search is unavailable right now" }],
    });
    await expect(searchTitles("x")).rejects.toThrow(
      "Search is unavailable right now",
    );
  });

  it("rejects responses without a result list", async () => {
    respond(200, { data: {} });
    await expect(searchTitles("x")).rejects.toThrow("Search failed");
    respond(502, "<html>Bad gateway</html>");
    await expect(searchTitles("x")).rejects.toThrow("Search failed");
  });
});
