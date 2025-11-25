import React, { useEffect, useMemo, useState } from "react";

import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useActivePromotionList } from "@/services/PromotionServices";

import { OrderService } from "../../services/OrderService";
import { MenuItem, useProducts } from "../Product/ProductContext";
import { CartItem, useCart } from "./Cart";
import styles from "./CartView.module.css";
import { type PaymentMethod, PaymentModal } from "./PaymentModal";
import { NormalizedPromotion } from "@/models/Promotion";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80";

type PotentialGift = { id: number; type: "product" | "combo"; quantity: number };
type DisplayGift = { id: number; name: string; image?: Uint8Array; quantity: number; isCompensated: boolean; type: "product" | "combo" };

const getImageUrl = (image: Uint8Array | undefined) => {
  if (!image) return PLACEHOLDER_IMAGE;

  let buffer: ArrayBuffer;
  if (image instanceof Uint8Array) {
    buffer = image.slice().buffer as unknown as ArrayBuffer;
  } else if (typeof image === "object" && image !== null && "byteLength" in image) {
    buffer = new Uint8Array(image as ArrayBufferLike).slice().buffer as unknown as ArrayBuffer;
  } else {
    return PLACEHOLDER_IMAGE;
  }

  const view = new Uint8Array(buffer);
  let mimeType = "image/jpeg";
  if (view.length > 4) {
    if (view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4e && view[3] === 0x47) {
      mimeType = "image/png";
    } else if (view[0] === 0x47 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x38) {
      mimeType = "image/gif";
    }
  }

  const blob = new Blob([buffer], { type: mimeType });
  return URL.createObjectURL(blob);
};

export const CartView: React.FC = () => {
  const { validItems, updateQuantity, removeFromCart, clearCart, appliedThresholdPromotions } = useCart();
  const { productsMap, combosMap } = useProducts();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const { data: promotions = [] } = useActivePromotionList();

  const handleQuantityChange = (id: number, type: "product" | "combo", newQuantity: number) => {
    if (newQuantity < 1) {
      const originalItem = validItems.find(item => item.id === id && item.type === type);
      if (originalItem && originalItem.quantity > 0) {
        removeFromCart(id, type);
      }
    } else {
      updateQuantity(id, type, newQuantity);
    }
  };

  const checkStock = (): string[] => {
    const outOfStock: string[] = [];

    validItems.forEach((item) => {
      const entity = item.type === "product" ? productsMap[item.id] : combosMap[item.id];

      if (entity && !entity.available) {
        outOfStock.push(entity.name);
      }
    });

    return outOfStock;
  };

  const totalEarnedGifts = useMemo(() => {
    const giftsMap = new Map<string, PotentialGift>();

    const addGift = (id: number, type: "product" | "combo", quantity: number) => {
      const key = `${type}-${id}`;
      const existing = giftsMap.get(key) || { id, type, quantity: 0 };
      existing.quantity += quantity;
      giftsMap.set(key, existing);
    };

    validItems.forEach((item) => {
      const itemPromos = promotions.filter((promotion) => {
        if (promotion.type !== "BUY_GIVE_FREE") return false;

        const collection = item.type === "product" ? promotion.product : promotion.combo;
        return collection ? collection.some((c) => c.id === item.id) : false;
      });

      itemPromos.forEach((promo) => {
        if (promo.type !== "BUY_GIVE_FREE") return;

        const giftQty = promo.oneFreePerTrigger ? item.quantity : 1;
        promo.freeProducts?.forEach((gift) => addGift(gift.id, "product", giftQty));
        promo.freeCombos?.forEach((gift) => addGift(gift.id, "combo", giftQty));
      });
    });

    return giftsMap;
  }, [validItems, promotions]);

  const handleCheckout = async (method: PaymentMethod) => {
    try {
      const outOfStock = checkStock();
      if (outOfStock.length > 0) {
        alert(`There is not stock enough for: ${outOfStock.join(", ")}`);
        return;
      }
      
      const consolidatedItems = new Map<string, number>();
      
      const isItemInCart = (id: number, type: "product" | "combo"): boolean => {
          return validItems.some(item => item.id === id && item.type === type);
      };

      const addConsolidatedItem = (id: number, type: "product" | "combo", quantity: number) => {
          const key = `${type}-${id}`;
          const currentQuantity = consolidatedItems.get(key) || 0;
          consolidatedItems.set(key, currentQuantity + quantity);
      };

      validItems.forEach(item => {
          addConsolidatedItem(item.id, item.type, item.quantity);
      });

      totalEarnedGifts.forEach((gift) => {
          if (!isItemInCart(gift.id, gift.type)) {
              addConsolidatedItem(gift.id, gift.type, gift.quantity);
          }
      });

      const orderDetails = Array.from(consolidatedItems.entries()).map(([key, quantity]) => {
          const [type, idStr] = key.split('-');
          const id = parseInt(idStr);

          return {
              productId: type === 'product' ? id : null,
              comboId: type === 'combo' ? id : null,
              quantity: quantity,
          };
      });

      const order = await OrderService.createOrder({ details: orderDetails });
      await OrderService.payOrder(order.id, method);

      clearCart();
      setPaymentMethod(null);
      alert("Order Confirmed! The kitchen staff will start preparing it soon.");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error processing order:", err);
      alert(err.response?.data?.message || "Insufficient Stock or Invalid State");
    }
  };

  const { displayCartItems, displayEarnedGifts, calculatedTotalPrice } = useMemo(() => {
    const giftsToCompensate = new Map(totalEarnedGifts);
    const itemsForDisplay: CartItem[] = [];
    const compensatedGifts: PotentialGift[] = [];
    let runningTotal = 0;

    for (const item of validItems) {
      const key = `${item.type}-${item.id}`;
      const giftEntry = giftsToCompensate.get(key);
      
      let compensatedQty = 0;
      const originalPurchaseQty = item.quantity;
      let finalPurchaseQty = item.quantity;

      if (giftEntry) {
        compensatedQty = Math.min(originalPurchaseQty, giftEntry.quantity);
        
        finalPurchaseQty = originalPurchaseQty - compensatedQty; 
        const remainingGiftQty = giftEntry.quantity - compensatedQty;
        
        if (compensatedQty > 0) {
          compensatedGifts.push({ ...item, quantity: compensatedQty });
        }

        if (remainingGiftQty > 0) {
          giftsToCompensate.set(key, { ...giftEntry, quantity: remainingGiftQty });
        } else {
          giftsToCompensate.delete(key);
        }
      }

      if (finalPurchaseQty > 0) {
        itemsForDisplay.push({ ...item, quantity: finalPurchaseQty }); 
      }
    }

    const displayCartItems = itemsForDisplay
      .map((compensatedItem: CartItem) => {
        const originalItem = validItems.find(i => i.id === compensatedItem.id && i.type === compensatedItem.type);
        if (!originalItem) return null;
        
        const data =
          originalItem.type === "product"
            ? (productsMap[originalItem.id] as MenuItem | undefined)
            : (combosMap[originalItem.id] as MenuItem | undefined);

        if (!data) return null;

        const imageUrl = getImageUrl(data.image);
        const quantityToPay = compensatedItem.quantity;
        const originalSubtotal = data.price * quantityToPay;

        const itemPromos = promotions.filter((promotion) => {
          const collection = originalItem.type === "product" ? promotion.product : promotion.combo;
          return collection ? collection.some((c) => c.id === originalItem.id) : false;
        });

        let payableQuantity = quantityToPay;
        const activeLabels: string[] = [];

        itemPromos.forEach((promo) => {
          if (promo.type === "BUYX_PAYY") {
            const groups = Math.floor(payableQuantity / promo.buyQuantity);
            const remainder = payableQuantity % promo.buyQuantity;
            payableQuantity = groups * promo.payQuantity + remainder;
            if (quantityToPay >= promo.buyQuantity) {
              activeLabels.push(`${promo.buyQuantity}x${promo.payQuantity}`);
            }
          }
        });

        let finalSubtotal = payableQuantity * data.price;

        itemPromos.forEach((promo) => {
          if (promo.type === "PERCENTAGE") {
            finalSubtotal -= (finalSubtotal * promo.percentage) / 100;
            activeLabels.push(`-${promo.percentage}%`);
          }
        });
        
        runningTotal += finalSubtotal;
        
        return {
          key: `${originalItem.type}-${originalItem.id}`,
          data,
          imageUrl,
          originalCartItem: originalItem, 
          displayQuantity: quantityToPay, 
          originalSubtotal,
          finalSubtotal,
          activeLabels,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const finalEarnedGifts: DisplayGift[] = [];

    compensatedGifts.forEach(({ id, type, quantity }) => {
      const entity = (type === "product" ? productsMap[id] : combosMap[id]);
      finalEarnedGifts.push({
        id,
        name: entity?.name ?? `Compensated Item #${id}`,
        image: entity?.image,
        quantity,
        isCompensated: true,
        type
      });
    });

    Array.from(giftsToCompensate.values()).forEach(({ id, type, quantity }) => {
      const entity = (type === "product" ? productsMap[id] : combosMap[id]);
      finalEarnedGifts.push({
        id,
        name: entity?.name ?? `Free Item #${id}`,
        image: entity?.image,
        quantity,
        isCompensated: false,
        type
      });
    });
    
    appliedThresholdPromotions.forEach((promo) => {
        const thresholdPromo = promo as NormalizedPromotion & { type: "THRESHOLD"; discountAmount: number };
        runningTotal -= thresholdPromo.discountAmount;
    });
    
    const calculatedTotalPrice = Math.max(0, runningTotal); 

    return { displayCartItems, displayEarnedGifts: finalEarnedGifts, calculatedTotalPrice };
  }, [validItems, productsMap, combosMap, promotions, totalEarnedGifts, appliedThresholdPromotions]);

  useEffect(() => {
    return () => {
      displayCartItems.forEach(({ imageUrl }) => {
        if (imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(imageUrl);
        }
      });
      displayEarnedGifts.forEach((gift) => {
        const imageUrl = getImageUrl(gift.image);
        if (imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(imageUrl);
        }
      });
    };
  }, [displayCartItems, displayEarnedGifts]);

  if (validItems.length === 0) {
    return (
      <CommonLayout>
        <div className={styles.cartContainer}>
          <div className={styles.emptyCart}>
            <p>Your cart is empty</p>
          </div>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <div className={styles.cartContainer}>
        <h2>Your order</h2>

        <div className={styles.cartItems}>
          {displayCartItems.map(({ key, data, imageUrl, originalSubtotal, finalSubtotal, activeLabels, originalCartItem, displayQuantity }) => (
            <div key={key} className={styles.cartItem}>
              <img src={imageUrl} alt={data.name} className={styles.cartItemImage} />

              <div className={styles.cartItemInfo}>
                <span className={styles.itemName}>{data.name}</span>
                <span className={styles.itemPrice}>${data.price.toFixed(2)} each</span>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                  {activeLabels.map((label, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: "#bf0c2b",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.quantityControls}>
                <button
                  className={styles.quantityButton}
                  onClick={() => handleQuantityChange(originalCartItem.id, originalCartItem.type, originalCartItem.quantity - 1)}
                >
                  -
                </button>
                <span className={styles.quantity}>{displayQuantity}</span> 
                <button
                  className={styles.quantityButton}
                  onClick={() => handleQuantityChange(originalCartItem.id, originalCartItem.type, originalCartItem.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className={styles.itemSubtotal}>
                {activeLabels.length > 0 ? (
                  <>
                    <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "0.9rem" }}>
                      ${originalSubtotal.toFixed(2)}
                    </span>
                    <span style={{ color: "#bf0c2b", fontWeight: 700, fontSize: "1.1rem" }}>
                      ${finalSubtotal.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>${finalSubtotal.toFixed(2)}</span>
                )}
              </div>

              <button
                className={styles.removeButton}
                onClick={() => removeFromCart(originalCartItem.id, originalCartItem.type)}
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}

          {displayEarnedGifts.length > 0 && (
            <>
              <div style={{ padding: "1.5rem 0 0.5rem", fontWeight: 700, color: "#10b981" }}>🎁 Free Gifts</div>
              {displayEarnedGifts.map((gift, index) => (
                <div 
                  key={`gift-${index}`} 
                  className={styles.cartItem} 
                  style={{ 
                    background: gift.isCompensated ? "#eff6ff" : "#f0fdf4", 
                    border: gift.isCompensated ? "1px solid #bfdbfe" : "none" 
                  }}
                >
                  <img src={getImageUrl(gift.image)} alt={gift.name} className={styles.cartItemImage} />
                  <div className={styles.cartItemInfo}>
                    <span className={styles.itemName}>{gift.name}</span>
                    <span 
                        className={styles.itemPrice} 
                        style={{ color: gift.isCompensated ? "#2563eb" : "#10b981", fontWeight: 700 }}
                    >
                      {gift.isCompensated ? "COMPENSATED" : "FREE"}
                    </span>
                    <div className={styles.quantityControls} style={{ border: "none", background: "transparent" }}>
                      <span className={styles.quantity}>Qty: {gift.quantity}</span>
                    </div>
                  </div>
                  <div className={styles.itemSubtotal}>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#10b981" }}>$0.00</span>
                  </div>
                  <div style={{ width: "40px" }} />
                </div>
              ))}
            </>
          )}
          {appliedThresholdPromotions.length > 0 && (
            <div style={{ marginBottom: "1rem", borderTop: "1px solid #e5e7eb", paddingTop: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "0.5rem 0", color: "#bf0c2b", fontWeight: 700 }}>
                <span style={{ fontSize: "1.1rem", marginRight: "8px" }}>✂️</span>
                Discounts Applied
              </div>
              {appliedThresholdPromotions.map((promo) => {
                const thresholdPromo = promo as NormalizedPromotion & { type: "THRESHOLD"; threshold: number; discountAmount: number };
                return (
                  <div key={thresholdPromo.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0" }}>
                    <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                      Discount for purchase over ${thresholdPromo.threshold.toFixed(2)}
                    </span>
                    <span style={{ color: "#bf0c2b", fontWeight: 700, fontSize: "1.1rem" }}>
                      -${thresholdPromo.discountAmount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.cartFooter}>
          <div className={styles.total}>
            <span>Total Amount</span>
            <span>${calculatedTotalPrice.toFixed(2)}</span>
          </div>

          <div className={styles.paymentButtons}>
            <h3>Select Payment Method</h3>
            <div className={styles.paymentOptionsGrid}>
              <button onClick={() => setPaymentMethod("credit")} className={styles.checkoutButton}>
                <span>💳</span>
                Credit / Debit
              </button>
              <button onClick={() => setPaymentMethod("cash")} className={styles.checkoutButton}>
                <span>💵</span>
                Cash
              </button>
              <button onClick={() => setPaymentMethod("qr")} className={styles.checkoutButton}>
                <span>📱</span>
                QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {paymentMethod && (
        <PaymentModal method={paymentMethod} onClose={() => setPaymentMethod(null)} onConfirm={handleCheckout} />
      )}
    </CommonLayout>
  );
};
