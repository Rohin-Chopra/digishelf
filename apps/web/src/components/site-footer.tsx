export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-6xl px-6 flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3"
        >
          <img
            src="/tmdb-logo.svg"
            alt="The Movie Database (TMDB)"
            width={120}
            height={16}
          />
        </a>
        <p>
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </div>
    </footer>
  );
}
