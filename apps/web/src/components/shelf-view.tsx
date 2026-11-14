import { Link } from "@tanstack/react-router";
import { useShelf } from "@/hooks/use-shelf";
import { removeFromShelf } from "@/lib/shelf-store";
import { titleKey } from "@/lib/title";
import { Poster } from "./poster";
import { POSTER_GRID_SIZES, PosterGrid } from "./poster-grid";
import { TitleMeta } from "./title-meta";

export function ShelfView() {
  const items = useShelf();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-white/15 p-10">
        <p className="text-lg">Your shelf is empty.</p>
        <p className="text-muted">
          Search for the movies and shows you love and put them here.
        </p>
        <Link
          to="/search"
          className="rounded-full bg-accent px-5 py-2 font-medium text-background hover:bg-accent/90"
        >
          Find something to add
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted">
        {items.length} {items.length === 1 ? "title" : "titles"}
      </p>
      <PosterGrid label="My shelf">
        {items.map((item) => (
          <li key={titleKey(item)} className="group flex flex-col gap-2">
            <div className="relative">
              <Poster title={item} sizes={POSTER_GRID_SIZES} />
              <button
                type="button"
                onClick={() => removeFromShelf(item)}
                aria-label={`Remove ${item.name} from shelf`}
                title="Remove from shelf"
                className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-sm text-foreground opacity-0 ring-1 ring-white/20 transition group-hover:opacity-100 hover:bg-black focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
              >
                ✕
              </button>
            </div>
            <TitleMeta title={item} />
          </li>
        ))}
      </PosterGrid>
    </>
  );
}
