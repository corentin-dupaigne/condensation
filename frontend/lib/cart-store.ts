"use client";

import { useSyncExternalStore } from "react";
import type { Game, GameDetail, Platform, SteamPlatforms } from "@/lib/types";

export type CartItem = {
  id: string;
  title: string;
  image?: string | null;
  platforms: Platform[];
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
  updatedAt: number;
};

const STORAGE_KEY = "condensation.cart.v1";
const EMPTY_STATE: CartState = { items: [], updatedAt: 0 };

let cachedRaw: string | null | undefined = undefined;
let cachedState: CartState = EMPTY_STATE;

function now() {
  return Date.now();
}

function safeParse(json: string | null): CartState | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "items" in parsed &&
      Array.isArray((parsed as { items: unknown }).items)
    ) {
      const state = parsed as CartState;
      return {
        items: state.items.filter(Boolean),
        updatedAt: typeof state.updatedAt === "number" ? state.updatedAt : now(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function ensureCache() {
  if (typeof window === "undefined") {
    cachedRaw = null;
    cachedState = EMPTY_STATE;
    return;
  }

  const raw = readRaw();
  if (cachedRaw === raw) return;

  cachedRaw = raw;
  cachedState = safeParse(raw) ?? EMPTY_STATE;
}

function readState(): CartState {
  ensureCache();
  return cachedState;
}

function writeState(next: CartState) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedState = next;
  cachedRaw = raw;
  notifyListeners();
}

const listeners: Set<() => void> = new Set();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeCart(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  listeners.add(listener);

  // Handle cross-tab changes via storage event
  const storageHandler = () => {
    const before = cachedRaw;
    ensureCache();
    if (before !== cachedRaw) listener();
  };

  window.addEventListener("storage", storageHandler);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", storageHandler);
  };
}

export function getCart(): CartState {
  return readState();
}

export function clearCart() {
  writeState({ items: [], updatedAt: now() });
}

export function removeFromCart(id: string) {
  const state = readState();
  const nextItems = state.items.filter((it) => it.id !== id);
  writeState({ items: nextItems, updatedAt: now() });
}

export function setCartItemQty(id: string, qty: number) {
  const clampedQty = Math.max(1, Math.min(99, Math.floor(qty)));
  const state = readState();
  const nextItems = state.items.map((it) =>
    it.id === id ? { ...it, qty: clampedQty } : it,
  );
  writeState({ items: nextItems, updatedAt: now() });
}

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  const addQty = Math.max(1, Math.min(99, Math.floor(qty)));
  const state = readState();
  const existing = state.items.find((it) => it.id === item.id);
  const nextItems = existing
    ? state.items.map((it) =>
        it.id === item.id
          ? { ...it, qty: Math.max(1, Math.min(99, it.qty + addQty)) }
          : it,
      )
    : [...state.items, { ...item, qty: addQty }];

  writeState({ items: nextItems, updatedAt: now() });
}

export function cartItemFromGame(game: Game | GameDetail): Omit<CartItem, "qty"> {
  const platforms = normalizePlatforms(game.platforms);
  return {
    id: game.slug,
    title: game.title,
    image: game.image ?? (("headerImage" in game ? game.headerImage : undefined) as
      | string
      | undefined) ?? null,
    platforms,
    price: game.price,
    originalPrice: game.originalPrice ?? null,
    discountPercent: game.discountPercent ?? null,
  };
}

function normalizePlatforms(platforms: Platform[] | SteamPlatforms): Platform[] {
  if (Array.isArray(platforms)) return platforms;
  const list: Platform[] = [];
  if (platforms.windows) list.push("windows");
  if (platforms.mac) list.push("mac");
  if (platforms.linux) list.push("linux");
  return list;
}

export function getCartCount(state: CartState): number {
  return state.items.reduce((sum, it) => sum + (it.qty || 0), 0);
}

export function getCartSubtotal(state: CartState): number {
  return state.items.reduce((sum, it) => sum + it.price * it.qty, 0);
}

export function useCartState(): CartState {
  return useSyncExternalStore(subscribeCart, getCart, () => EMPTY_STATE);
}

export function useCartCount(): number {
  const state = useCartState();
  return getCartCount(state);
}

export function useCartSubtotal(): number {
  const state = useCartState();
  return getCartSubtotal(state);
}

