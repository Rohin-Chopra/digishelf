import type { NextRequest } from "next/server";
import { searchTitles, TmdbConfigError, TmdbRequestError } from "@/lib/tmdb";

const MAX_QUERY_LENGTH = 100;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return Response.json({ results: [] });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return Response.json({ error: "Query is too long" }, { status: 400 });
  }

  try {
    const results = await searchTitles(query);
    return Response.json(
      { results },
      { headers: { "cache-control": "public, max-age=300" } },
    );
  } catch (error) {
    if (error instanceof TmdbConfigError) {
      return Response.json(
        { error: "Search is not configured" },
        { status: 503 },
      );
    }
    if (error instanceof TmdbRequestError) {
      console.error(error);
      return Response.json(
        { error: "Search is unavailable right now" },
        { status: 502 },
      );
    }
    throw error;
  }
}
