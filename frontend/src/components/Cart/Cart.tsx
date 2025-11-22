import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
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
  appliedThresholdPromotions: NormalizedPromotion[];
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

  const findPromotionsForItem = useCallback((item: CartItem): NormalizedPromotion[] => {
    return promotions.filter((promotion) => {
      const collection = item.type === "product" ? promotion.products : promotion.combos;
      return collection ? Object.prototype.hasOwnProperty.call(collection, item.id) : false;
    });
  }, [promotions]);

  const calculateItemTotal = useCallback((item: CartItem): number => {
    const entity = item.type === "product" ? productsMap[item.id] : combosMap[item.id];
    if (!entity) return 0;

    const itemPromos = findPromotionsForItem(item);
    let payableQuantity = item.quantity;

    itemPromos.forEach((promo) => {
      if (promo.type === "BUYX_PAYY") {
        const groups = Math.floor(payableQuantity / promo.buyQuantity);
        const remainder = payableQuantity % promo.buyQuantity;
        payableQuantity = groups * promo.payQuantity + remainder;
      }
    });

    let finalPrice = entity.price * payableQuantity;

    itemPromos.forEach((promo) => {
      if (promo.type === "PERCENTAGE") {
        finalPrice -= (finalPrice * promo.percentage) / 100;
      }
    });

    return finalPrice;
  }, [productsMap, combosMap, findPromotionsForItem]);

  const isThresholdPromotion = (
    promotion: NormalizedPromotion,
  ): promotion is NormalizedPromotion & { type: "THRESHOLD"; threshold: number; discountAmount: number } => {
    return promotion.type === "THRESHOLD";
  };

  // Aquí modificamos para devolver también las promos threshold aplicadas
  const totalPriceAndAppliedPromos = useMemo(() => {
    const subtotal = validItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);

    let finalTotal = subtotal;
    const appliedThresholds: NormalizedPromotion[] = [];

    promotions
      .filter(isThresholdPromotion)
      .forEach((promotion) => {
        if (subtotal >= promotion.threshold) {
          finalTotal -= promotion.discountAmount;
          appliedThresholds.push(promotion);
        }
      });

    return {
      totalPrice: Math.max(0, finalTotal),
      appliedThresholdPromotions: appliedThresholds,
    };
  }, [validItems, calculateItemTotal, promotions]);

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
    <CartContext.Provider
      value={{
        items: cart,
        setCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        validItems,
        totalPrice: totalPriceAndAppliedPromos.totalPrice,
        appliedThresholdPromotions: totalPriceAndAppliedPromos.appliedThresholdPromotions,
      }}
    >
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
