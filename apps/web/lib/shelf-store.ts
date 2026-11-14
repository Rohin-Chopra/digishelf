import type { Title } from "./title";
import { titleKey } from "./title";

export const SHELF_STORAGE_KEY = "digishelf:shelf:v1";

export interface ShelfItem extends Title {
  addedAt: string;
}

const EMPTY: ShelfItem[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedItems: ShelfItem[] = EMPTY;
let memoryOnly = false;

function parse(raw: string | null): ShelfItem[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as ShelfItem[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

// Storage can throw (blocked site data, quota); fall back to the in-memory copy.
function readRaw(): string | null {
  if (memoryOnly) return cachedRaw;
  try {
    return window.localStorage.getItem(SHELF_STORAGE_KEY);
  } catch {
    return cachedRaw;
  }
}

export function getShelf(): ShelfItem[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parse(raw);
  }
  return cachedItems;
}

export function getServerShelf(): ShelfItem[] {
  return EMPTY;
}

function write(items: ShelfItem[]) {
  cachedRaw = JSON.stringify(items);
  cachedItems = items;
  try {
    window.localStorage.setItem(SHELF_STORAGE_KEY, cachedRaw);
  } catch {
    // Keep the in-memory shelf for this page view.
    memoryOnly = true;
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SHELF_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function addToShelf(title: Title, now: Date = new Date()) {
  const items = getShelf();
  const key = titleKey(title);
  if (items.some((item) => titleKey(item) === key)) return;
  write([{ ...title, addedAt: now.toISOString() }, ...items]);
}

export function removeFromShelf(title: Pick<Title, "id" | "mediaType">) {
  const key = titleKey(title);
  write(getShelf().filter((item) => titleKey(item) !== key));
}
