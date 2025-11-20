import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useToken } from "@/services/TokenContext";
import { useProducts } from "@/components/Product/ProductContext";
import { useActivePromotionList } from "@/services/PromotionServices";
import { NormalizedPromotion } from "@/models/Promotion";

export type CartItem = {
  id: number;
  type: "product" | "combo";
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (id: number, type: "product" | "combo", quantity?: number) => void;
  updateQuantity: (id: number, type: "product" | "combo", newQuantity: number) => void;
  removeFromCart: (id: number, type: "product" | "combo") => void;
  clearCart: () => void;
  validItems: CartItem[];
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [tokenState] = useToken();
  const { productsMap, combosMap } = useProducts();
  const { data: promotions = [] } = useActivePromotionList();
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

  const validItems = useMemo(() => {
    return cart.filter((item: CartItem) =>
      (item.type === "product" && Boolean(productsMap[item.id])) ||
      (item.type === "combo" && Boolean(combosMap[item.id]))
    );
  }, [cart, productsMap, combosMap]);

  useEffect(() => {
    if (!productsMap || Object.keys(productsMap).length === 0) return;
    if (validItems.length !== cart.length) {
      setCart(validItems as CartItem[]);
    }
  }, [validItems, cart, productsMap, setCart]);

  const findPromotionForItem = (item: CartItem): NormalizedPromotion | undefined => {
    return promotions.find((promotion) => {
      const collection = item.type === "product" ? promotion.products : promotion.combos;
      return collection ? Object.prototype.hasOwnProperty.call(collection, item.id) : false;
    });
  };

  const calculateItemTotal = (item: CartItem): number => {
    const entity = item.type === "product" ? productsMap[item.id] : combosMap[item.id];
    if (!entity) return 0;

    let finalPrice = entity.price * item.quantity;
    const promo = findPromotionForItem(item);

    if (promo) {
      if (promo.type === "PERCENTAGE") {
        finalPrice -= (finalPrice * promo.percentage) / 100;
      } else if (promo.type === "BUYX_PAYY") {
        const groups = Math.floor(item.quantity / promo.buyQuantity);
        const remainder = item.quantity % promo.buyQuantity;
        const paidQuantity = groups * promo.payQuantity + remainder;
        finalPrice = paidQuantity * entity.price;
      }
    }

    return finalPrice;
  };

  const isThresholdPromotion = (
    promotion: NormalizedPromotion,
  ): promotion is NormalizedPromotion & { type: "THRESHOLD"; threshold: number; discountAmount: number } => {
    return promotion.type === "THRESHOLD";
  };

  const totalPrice = useMemo(() => {
    const subtotal = validItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);

    const thresholdPromo = promotions.find(isThresholdPromotion);

    if (thresholdPromo && subtotal >= thresholdPromo.threshold) {
      return Math.max(0, subtotal - thresholdPromo.discountAmount);
    }

    return Math.max(0, subtotal);
  }, [validItems, productsMap, combosMap, promotions]);

  const addToCart = (id: number, type: "product" | "combo", quantity: number = 1) => {
    setCart((prevItems: CartItem[]) => {
      const existing = prevItems.find((item: CartItem) => item.id === id && item.type === type);
      if (existing) {
        return prevItems.map((item: CartItem) =>
          item.id === id && item.type === type
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { id, type, quantity }];
    });
  };

  const updateQuantity = (id: number, type: "product" | "combo", newQuantity: number) => {
    setCart((prevItems: CartItem[]) =>
      prevItems.map((item: CartItem) =>
        item.id === id && item.type === type
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (id: number, type: "product" | "combo") => {
    setCart((prevItems: CartItem[]) =>
      prevItems.filter((item: CartItem) => !(item.id === id && item.type === type))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ items: cart, setCart, addToCart, updateQuantity, removeFromCart, clearCart, validItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
