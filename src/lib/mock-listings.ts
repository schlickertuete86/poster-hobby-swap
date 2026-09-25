import { useSyncExternalStore } from "react";
import type { Listing } from "./catalog";

// Prototype-only store: listings live in memory for the current browser session.
let items: Listing[] = [];
const listeners = new Set<() => void>();
const empty: Listing[] = [];

export function addMockListing(listing: Listing) {
  items = [listing, ...items];
  listeners.forEach((listener) => listener());
}

export function useMockListings() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    () => items,
    () => empty,
  );
}
