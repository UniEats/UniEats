import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToken } from "@/services/TokenContext";
import { useProducts } from "@/components/Product/ProductContext";

type CartItem = {
  id: number;
  type: "product" | "combo";
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (id: number, type: "product" | "combo", quantity?: number) => void;
  removeFromCart: (id: number, type: "product" | "combo") => void;
  clearCart: () => void;
  validItems: CartItem[];
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [tokenState] = useToken();
  const { productsMap, combosMap } = useProducts();
  const userId = tokenState.state === "LOGGED_IN" ? tokenState.tokens.id : null;
  const storageKey = `cart_${userId}`;
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setCart(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, storageKey]);

  const validItems = React.useMemo(() => {
    return cart.filter(
      (item) =>
        (item.type === "product" && productsMap[item.id]) ||
        (item.type === "combo" && combosMap[item.id])
    );
  }, [cart, productsMap, combosMap]);

  useEffect(() => {
    if (!productsMap || Object.keys(productsMap).length === 0) return;
    if (validItems.length !== cart.length) {
      setCart(validItems);
    }
  }, [validItems, cart, productsMap, setCart]);

  const totalPrice = React.useMemo(() => {
    return validItems.reduce((acc, item) => {
      const price =
        item.type === "product"
          ? productsMap[item.id]?.price ?? 0
          : combosMap[item.id]?.price ?? 0;
      return acc + price * item.quantity;
    }, 0);
  }, [validItems, productsMap, combosMap]);

  const addToCart = (id: number, type: "product" | "combo", quantity: number = 1) => {
    setCart((prevItems) => {
      const existing = prevItems.find((item) => item.id === id && item.type === type);
      if (existing) {
        return prevItems.map((item) =>
          item.id === id && item.type === type
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { id, type, quantity }];
    });
  };

  const removeFromCart = (id: number, type: "product" | "combo") => {
    setCart((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.type === type))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ items: cart, setCart, addToCart, removeFromCart, clearCart, validItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
