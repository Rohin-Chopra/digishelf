import { Suspense } from "react";
import { PosterGridSkeleton } from "@/components/poster-grid";
import { ShelfView } from "@/components/shelf-view";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 font-display text-5xl tracking-wide">My shelf</h1>
      <Suspense fallback={<PosterGridSkeleton />}>
        <ShelfView />
      </Suspense>
    </main>
  );
}
