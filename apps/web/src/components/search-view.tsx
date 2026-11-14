import { useEffect, useState } from "react";
import { useShelf } from "@/hooks/use-shelf";
import { useTitleSearch } from "@/hooks/use-title-search";
import { addToShelf, removeFromShelf } from "@/lib/shelf-store";
import { titleKey } from "@/lib/title";
import { Poster } from "./poster";
import {
  POSTER_GRID_SIZES,
  PosterGrid,
  PosterGridSkeleton,
} from "./poster-grid";
import { TitleMeta } from "./title-meta";

const DEBOUNCE_MS = 300;

export function SearchView({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const [input, setInput] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  // The URL changed without the search box (header link, back/forward).
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setInput(query);
  }
  const { results, error, loading } = useTitleSearch(query);
  const shelf = useShelf();
  const shelfKeys = new Set(shelf.map(titleKey));

  function updateQuery(value: string) {
    const next = value.trim();
    if (next === query) return;
    setSyncedQuery(next);
    onQueryChange(next);
  }

  useEffect(() => {
    const timeout = setTimeout(() => updateQuery(input), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  });

  return (
    <div className="flex flex-col gap-8">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          updateQuery(input);
        }}
      >
        <label htmlFor="search" className="sr-only">
          Search movies and TV shows
        </label>
        <input
          id="search"
          type="search"
          autoFocus
          autoComplete="off"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search movies and TV shows…"
          maxLength={100}
          className="w-full rounded-lg border border-white/15 bg-surface px-5 py-4 text-lg placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </form>

      {error ? (
        <p role="alert" className="text-red-300">
          {error}
        </p>
      ) : loading ? (
        <PosterGridSkeleton />
      ) : query && results.length === 0 ? (
        <p className="text-muted">No results for “{query}”.</p>
      ) : (
        <PosterGrid label="Search results">
          {results.map((title) => {
            const onShelf = shelfKeys.has(titleKey(title));
            return (
              <li key={titleKey(title)} className="flex flex-col gap-2">
                <Poster title={title} sizes={POSTER_GRID_SIZES} />
                <TitleMeta title={title} />
                <button
                  type="button"
                  aria-pressed={onShelf}
                  aria-label={
                    onShelf
                      ? `Remove ${title.name} from shelf`
                      : `Add ${title.name} to shelf`
                  }
                  onClick={() =>
                    onShelf ? removeFromShelf(title) : addToShelf(title)
                  }
                  className={
                    onShelf
                      ? "rounded-full border border-accent px-3 py-1.5 text-sm text-accent hover:bg-accent/10"
                      : "rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-background hover:bg-accent/90"
                  }
                >
                  {onShelf ? "On your shelf ✓" : "Add to shelf"}
                </button>
              </li>
            );
          })}
        </PosterGrid>
      )}
    </div>
  );
}
