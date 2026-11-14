import { useQuery } from "@tanstack/react-query";
import { searchTitles } from "@/lib/graphql";

export function useTitleSearch(query: string) {
  const { data, error, isPending } = useQuery({
    queryKey: ["search", query],
    queryFn: ({ signal }) => searchTitles(query, signal),
    enabled: query !== "",
  });
  return {
    results: query ? (data ?? []) : [],
    error: query && error ? error.message : null,
    loading: query !== "" && isPending,
  };
}
