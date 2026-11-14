import { createFileRoute } from "@tanstack/react-router";
import { SearchView } from "@/components/search-view";

export interface SearchParams {
  q?: string;
}

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const q = typeof search.q === "string" ? search.q.trim() : "";
    return q ? { q } : {};
  },
  head: () => ({ meta: [{ title: "Add titles | Digishelf" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 font-display text-5xl tracking-wide">Add titles</h1>
      <SearchView
        query={q}
        onQueryChange={(next) =>
          navigate({ search: next ? { q: next } : {}, replace: true })
        }
      />
    </main>
  );
}
