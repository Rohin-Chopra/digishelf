export type MediaType = "movie" | "tv";

export interface Title {
  id: number;
  mediaType: MediaType;
  name: string;
  year: number | null;
  posterPath: string | null;
  overview: string;
}

export function titleKey(title: Pick<Title, "id" | "mediaType">): string {
  return `${title.mediaType}:${title.id}`;
}
