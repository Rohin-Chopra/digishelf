/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Digishelf" },
      {
        name: "description",
        content:
          "A digital shelf for the movies and TV shows you love, so you can cherish them later.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://image.tmdb.org" },
    ],
  }),
  shellComponent: Document,
  component: Layout,
});

function Document({ children }: { children: ReactNode }) {
  // Marks the page interactive; the e2e suite waits for it before typing.
  useEffect(() => {
    document.documentElement.dataset.hydrated = "";
  }, []);
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Layout() {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </>
  );
}
