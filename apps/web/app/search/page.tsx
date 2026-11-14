import type { Metadata } from "next";
import { Suspense } from "react";
import { PosterGridSkeleton } from "@/components/poster-grid";
import { SearchView } from "@/components/search-view";

export const metadata: Metadata = {
  title: "Add titles",
};

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 font-display text-5xl tracking-wide">Add titles</h1>
      <Suspense fallback={<PosterGridSkeleton />}>
        <SearchView />
      </Suspense>
    </main>
  );
}
