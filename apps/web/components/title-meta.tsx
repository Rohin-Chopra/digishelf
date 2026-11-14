import type { Title } from "@/lib/title";

export function TitleMeta({ title }: { title: Title }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium" title={title.name}>
        {title.name}
      </p>
      <p className="text-xs text-muted">
        {title.mediaType === "movie" ? "Movie" : "TV"}
        {title.year ? ` · ${title.year}` : ""}
      </p>
    </div>
  );
}
