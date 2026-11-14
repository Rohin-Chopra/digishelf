import type { ReactNode } from "react";

export const POSTER_GRID_SIZES =
  "(min-width: 1024px) 180px, (min-width: 640px) 25vw, 45vw";

export function PosterGrid({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <ul
      aria-label={label}
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6"
    >
      {children}
    </ul>
  );
}

export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      aria-hidden
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="aspect-[2/3] animate-pulse rounded-md bg-surface"
        />
      ))}
    </div>
  );
}
