import { useSyncExternalStore } from "react";
import { getServerShelf, getShelf, subscribe } from "@/lib/shelf-store";

export function useShelf() {
  return useSyncExternalStore(subscribe, getShelf, getServerShelf);
}
