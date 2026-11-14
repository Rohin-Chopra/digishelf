import type { Title } from "./title";

export const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL ?? "/graphql";

const SEARCH = /* GraphQL */ `
  query Search($query: String!) {
    search(query: $query) {
      id
      mediaType
      name
      year
      posterPath
      overview
    }
  }
`;

interface GraphQLTitle extends Omit<Title, "mediaType"> {
  mediaType: "MOVIE" | "TV";
}

interface GraphQLResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

export async function searchTitles(
  query: string,
  signal?: AbortSignal,
): Promise<Title[]> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: SEARCH, variables: { query } }),
    signal,
  });
  const body = (await response.json().catch(() => null)) as GraphQLResponse<{
    search: GraphQLTitle[];
  }> | null;
  const message = body?.errors?.[0]?.message;
  if (message) throw new Error(message);
  const titles = body?.data?.search;
  if (!response.ok || !Array.isArray(titles)) throw new Error("Search failed");
  return titles.map((title) => ({
    ...title,
    mediaType: title.mediaType === "TV" ? "tv" : "movie",
  }));
}
