import "server-only";
import type { MediaType, Title } from "./title";

const DEFAULT_BASE_URL = "https://api.themoviedb.org/3";

interface TmdbMultiResult {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
}

interface TmdbSearchResponse {
  results: TmdbMultiResult[];
}

export class TmdbConfigError extends Error {}

export class TmdbRequestError extends Error {
  constructor(public readonly status: number) {
    super(`TMDB request failed with status ${status}`);
  }
}

function parseYear(date: string | undefined): number | null {
  if (!date) return null;
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

function isMediaType(value: string): value is MediaType {
  return value === "movie" || value === "tv";
}

export function toTitle(result: TmdbMultiResult): Title | null {
  if (!isMediaType(result.media_type)) return null;
  const name = result.media_type === "movie" ? result.title : result.name;
  if (!name) return null;
  return {
    id: result.id,
    mediaType: result.media_type,
    name,
    year: parseYear(
      result.media_type === "movie"
        ? result.release_date
        : result.first_air_date,
    ),
    posterPath: result.poster_path ?? null,
    overview: result.overview ?? "",
  };
}

function buildRequest(path: string, params: Record<string, string>) {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    throw new TmdbConfigError("TMDB_API_KEY is not set");
  }

  const baseUrl = process.env.TMDB_API_BASE_URL ?? DEFAULT_BASE_URL;
  const url = new URL(`${baseUrl.replace(/\/$/, "")}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = { accept: "application/json" };
  // v4 read access tokens are JWTs; anything else is treated as a v3 API key.
  if (apiKey.startsWith("eyJ")) {
    headers.authorization = `Bearer ${apiKey}`;
  } else {
    url.searchParams.set("api_key", apiKey);
  }

  return { url, headers };
}

export async function searchTitles(query: string): Promise<Title[]> {
  const { url, headers } = buildRequest("/search/multi", {
    query,
    include_adult: "false",
    language: "en-US",
    page: "1",
  });

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new TmdbRequestError(response.status);
  }

  const data = (await response.json()) as TmdbSearchResponse;
  return data.results.flatMap((result) => toTitle(result) ?? []);
}
