import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          to="/"
          className="font-display text-3xl tracking-wide text-accent"
        >
          Digishelf
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-accent">
            My shelf
          </Link>
          <Link
            to="/search"
            search={{}}
            className="rounded-full bg-accent px-4 py-2 text-background hover:bg-accent/90"
          >
            Add titles
          </Link>
        </nav>
      </div>
    </header>
  );
}
