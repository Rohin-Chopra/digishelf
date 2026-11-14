import { describe, expect, it, vi } from "vitest";
import {
  addToShelf,
  getShelf,
  removeFromShelf,
  SHELF_STORAGE_KEY,
  subscribe,
} from "@/lib/shelf-store";
import type { Title } from "@/lib/title";

const matrix: Title = {
  id: 603,
  mediaType: "movie",
  name: "The Matrix",
  year: 1999,
  posterPath: "/matrix.jpg",
  overview: "",
};
const matrixShow: Title = {
  ...matrix,
  mediaType: "tv",
  name: "The Matrix (TV)",
};

describe("shelf store", () => {
  it("starts empty and returns a stable snapshot", () => {
    expect(getShelf()).toEqual([]);
    expect(getShelf()).toBe(getShelf());
  });

  it("adds newest first, persists, and ignores duplicates", () => {
    addToShelf(matrix, new Date("2026-01-01T00:00:00Z"));
    addToShelf(matrixShow, new Date("2026-01-02T00:00:00Z"));
    addToShelf(matrix);

    expect(getShelf().map((i) => i.name)).toEqual([
      "The Matrix (TV)",
      "The Matrix",
    ]);
    expect(getShelf()[1].addedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(
      JSON.parse(window.localStorage.getItem(SHELF_STORAGE_KEY)!),
    ).toHaveLength(2);
  });

  it("treats a movie and a show with the same id as different titles", () => {
    addToShelf(matrix);
    addToShelf(matrixShow);
    removeFromShelf(matrix);
    expect(getShelf().map((i) => i.mediaType)).toEqual(["tv"]);
  });

  it("notifies subscribers on change and on cross-tab storage events", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    addToShelf(matrix);
    expect(listener).toHaveBeenCalledTimes(1);

    window.dispatchEvent(
      new StorageEvent("storage", { key: SHELF_STORAGE_KEY }),
    );
    window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    removeFromShelf(matrix);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("recovers from corrupt storage", () => {
    window.localStorage.setItem(SHELF_STORAGE_KEY, "{not json");
    expect(getShelf()).toEqual([]);
    addToShelf(matrix);
    expect(getShelf()).toHaveLength(1);
  });

  it("keeps working in memory when storage is blocked", () => {
    const blocked = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(blocked);
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(blocked);
    try {
      expect(() => getShelf()).not.toThrow();
      addToShelf(matrix);
      expect(getShelf().map((item) => item.name)).toEqual(["The Matrix"]);
      removeFromShelf(matrix);
      expect(getShelf()).toEqual([]);
    } finally {
      getItem.mockRestore();
      setItem.mockRestore();
    }
  });

  it("keeps changes in memory when storage is full", async () => {
    vi.resetModules();
    const store = await import("@/lib/shelf-store");
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("full", "QuotaExceededError");
      });
    try {
      store.addToShelf(matrix);
      expect(store.getShelf().map((item) => item.name)).toEqual(["The Matrix"]);
      expect(window.localStorage.getItem(SHELF_STORAGE_KEY)).toBeNull();
    } finally {
      setItem.mockRestore();
    }
  });
});
