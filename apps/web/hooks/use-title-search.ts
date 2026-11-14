"use client";

import { useEffect, useState } from "react";
import type { Title } from "@/lib/title";

interface SearchState {
  query: string;
  results: Title[];
  error: string | null;
}

export function useTitleSearch(query: string) {
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
    error: null,
  });

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as {
          results?: Title[];
          error?: string;
        };
        if (!response.ok || !Array.isArray(body.results)) {
          throw new Error(body.error ?? "Search failed");
        }
        setState({ query, results: body.results, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          query,
          results: [],
          error: error instanceof Error ? error.message : "Search failed",
        });
      });

    return () => controller.abort();
  }, [query]);

  const settled = state.query === query;
  return {
    results: settled ? state.results : [],
    error: settled ? state.error : null,
    loading: query !== "" && !settled,
  };
}
