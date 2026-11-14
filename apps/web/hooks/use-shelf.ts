"use client";

import { use, useSyncExternalStore } from "react";
import { browser } from "react-dom";
import { getServerShelf, getShelf, subscribe } from "@/lib/shelf-store";

export function useShelf() {
  use(browser("The shelf is stored in localStorage."));
  return useSyncExternalStore(subscribe, getShelf, getServerShelf);
}
