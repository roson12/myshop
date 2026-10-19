"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cartTotalCents,
  mergeCartItem,
  parseStoredCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

const STORAGE_KEY = "xorem-shop-cart";

type CartContextValue = {
  items: CartItem[];
  loaded: boolean;
  totalCents: number;
  addItem: (item: CartItem) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(parseStoredCart(window.localStorage.getItem(STORAGE_KEY)));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => mergeCartItem(current, item));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) => updateCartItemQuantity(current, productId, quantity));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => removeCartItem(current, productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      loaded,
      totalCents: cartTotalCents(items),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [items, loaded, addItem, setQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
