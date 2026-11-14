import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { PosterGridSkeleton } from "@/components/poster-grid";
import { ShelfView } from "@/components/shelf-view";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 font-display text-5xl tracking-wide">My shelf</h1>
      {/* The shelf lives in localStorage, so it can only render in the browser. */}
      <ClientOnly fallback={<PosterGridSkeleton />}>
        <ShelfView />
      </ClientOnly>
    </main>
  );
}
