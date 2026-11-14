import Image from "next/image";
import { posterLoader } from "@/lib/poster-loader";
import type { Title } from "@/lib/title";

export function Poster({ title, sizes }: { title: Title; sizes: string }) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface shadow-lg shadow-black/40 ring-1 ring-white/10">
      {title.posterPath ? (
        <Image
          loader={posterLoader}
          src={title.posterPath}
          alt={`${title.name} poster`}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-4 text-center font-display text-2xl tracking-wide text-muted">
          {title.name}
        </div>
      )}
    </div>
  );
}
