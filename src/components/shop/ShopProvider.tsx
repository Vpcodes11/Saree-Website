"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products } from "@/lib/products";

type BagItem = { productId: string; quantity: number };
type ShopContextValue = {
  items: BagItem[]; wishlist: string[]; count: number; total: number; ready: boolean;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (id: string) => void;
};
const ShopContext = createContext<ShopContextValue | null>(null);
const STORAGE_KEY = "aira-shop-v1";
const validId = (id: unknown): id is string => typeof id === "string" && products.some((product) => product.id === id);
const clamp = (quantity: number) => Math.max(1, Math.min(10, Number.isFinite(quantity) ? Math.floor(quantity) : 1));

export function ShopProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (stored && typeof stored === "object") {
        const data = stored as { items?: unknown; wishlist?: unknown };
        if (Array.isArray(data.items)) {
          const restored = new Map<string, number>();
          for (const candidate of data.items) {
            if (!candidate || typeof candidate !== "object") continue;
            const item = candidate as { productId?: unknown; quantity?: unknown };
            if (validId(item.productId) && typeof item.quantity === "number") restored.set(item.productId, clamp(item.quantity));
          }
          setItems([...restored].map(([productId, quantity]) => ({ productId, quantity })));
        }
        if (Array.isArray(data.wishlist)) setWishlist([...new Set(data.wishlist.filter(validId))]);
      }
    } catch { /* The shop remains usable when browser storage is unavailable. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, wishlist })); } catch { /* Keep this visit's state in memory. */ }
  }, [items, wishlist, ready]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    if (!validId(productId)) return;
    setItems((current) => {
      const found = current.find((item) => item.productId === productId);
      return found ? current.map((item) => item.productId === productId ? { ...item, quantity: clamp(item.quantity + clamp(quantity)) } : item) : [...current, { productId, quantity: clamp(quantity) }];
    });
  }, []);
  const removeItem = useCallback((productId: string) => setItems((current) => current.filter((item) => item.productId !== productId)), []);
  const setQuantity = useCallback((productId: string, quantity: number) => setItems((current) => current.map((item) => item.productId === productId ? { ...item, quantity: clamp(quantity) } : item)), []);
  const toggleWishlist = useCallback((id: string) => {
    if (validId(id)) setWishlist((current) => current.includes(id) ? current.filter((saved) => saved !== id) : [...current, id]);
  }, []);
  const value = useMemo(() => ({ items, wishlist, ready, addItem, removeItem, setQuantity, toggleWishlist,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + (products.find((product) => product.id === item.productId)?.price || 0) * item.quantity, 0),
  }), [items, wishlist, ready, addItem, removeItem, setQuantity, toggleWishlist]);
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop requires ShopProvider");
  return context;
}
