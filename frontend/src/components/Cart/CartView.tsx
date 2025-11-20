import React, { useEffect, useMemo, useState } from "react";

import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useActivePromotionList } from "@/services/PromotionServices";

import { OrderService } from "../../services/OrderService";
import { MenuItem, useProducts } from "../Product/ProductContext";
import { CartItem, useCart } from "./Cart";
import styles from "./CartView.module.css";
import { type PaymentMethod, PaymentModal } from "./PaymentModal";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80";

// Helper function to get image URL
const getImageUrl = (image: Uint8Array | undefined) => {
  if (!image) return PLACEHOLDER_IMAGE; // Placeholder

  let buffer: ArrayBuffer;
  if (image instanceof Uint8Array) {
    buffer = image.slice().buffer as unknown as ArrayBuffer;
  } else if (typeof image === "object" && image !== null && "byteLength" in image) {
    buffer = new Uint8Array(image as ArrayBufferLike).slice().buffer as unknown as ArrayBuffer;
  } else {
    return PLACEHOLDER_IMAGE; // Fallback
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
  const { validItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { productsMap, combosMap } = useProducts();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const { data: promotions = [] } = useActivePromotionList();

  const handleQuantityChange = (id: number, type: "product" | "combo", newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id, type);
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

  const handleCheckout = async (method: PaymentMethod) => {
    try {
      const outOfStock = checkStock();
      if (outOfStock.length > 0) {
        alert(`There is not stock enough for: ${outOfStock.join(", ")}`);
        return;
      }

      const orderDetails = validItems.map((item: CartItem) => {
        const product = item.type === "product" ? productsMap[item.id] : undefined;
        const combo = item.type === "combo" ? combosMap[item.id] : undefined;
        const price = product ? product.price : combo ? combo.price : 0;
        return {
          productId: item.type === "product" ? item.id : null,
          comboId: item.type === "combo" ? item.id : null,
          quantity: item.quantity,
          price,
          discount: 0,
        };
      });

      const order = await OrderService.createOrder({ details: orderDetails });
      await OrderService.confirmOrder(order.id);
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

  const cartItems = useMemo(() => {
    return validItems
      .map((item: CartItem) => {
        const data =
          item.type === "product"
            ? (productsMap[item.id] as MenuItem | undefined)
            : (combosMap[item.id] as MenuItem | undefined);

        if (!data) return null;

        const imageUrl = getImageUrl(data.image);
        const originalSubtotal = data.price * item.quantity;
        let finalSubtotal = originalSubtotal;
        let promoLabel: string | null = null;

        const promo = promotions.find((promotion) => {
          const collection = item.type === "product" ? promotion.products : promotion.combos;
          return collection ? Object.prototype.hasOwnProperty.call(collection, item.id) : false;
        });

        if (promo) {
          if (promo.type === "PERCENTAGE") {
            finalSubtotal = originalSubtotal * (1 - promo.percentage / 100);
            promoLabel = `-${promo.percentage}%`;
          } else if (promo.type === "BUYX_PAYY") {
            const groups = Math.floor(item.quantity / promo.buyQuantity);
            const remainder = item.quantity % promo.buyQuantity;
            const paidQty = groups * promo.payQuantity + remainder;
            finalSubtotal = paidQty * data.price;
            if (item.quantity >= promo.buyQuantity) {
              promoLabel = `${promo.buyQuantity}x${promo.payQuantity}`;
            }
          }
        }

        return {
          key: `${item.type}-${item.id}`,
          data,
          imageUrl,
          originalSubtotal,
          finalSubtotal,
          promoLabel,
          cartItem: item,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }, [validItems, productsMap, combosMap, promotions]);

  useEffect(() => {
    return () => {
      cartItems.forEach(({ imageUrl }) => {
        if (imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(imageUrl);
        }
      });
    };
  }, [cartItems]);

  if (cartItems.length === 0) {
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
          {cartItems.map(({ key, data, imageUrl, originalSubtotal, finalSubtotal, promoLabel, cartItem }) => (
            <div key={key} className={styles.cartItem}>
              <img src={imageUrl} alt={data.name} className={styles.cartItemImage} />

              <div className={styles.cartItemInfo}>
                <span className={styles.itemName}>{data.name}</span>
                <span className={styles.itemPrice}>${data.price.toFixed(2)} each</span>
                {promoLabel && (
                  <span
                    style={{
                      backgroundColor: "#bf0c2b",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      width: "fit-content",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      marginTop: "4px",
                    }}
                  >
                    {promoLabel}
                  </span>
                )}
              </div>

              <div className={styles.quantityControls}>
                <button
                  className={styles.quantityButton}
                  onClick={() => handleQuantityChange(cartItem.id, cartItem.type, cartItem.quantity - 1)}
                >
                  -
                </button>
                <span className={styles.quantity}>{cartItem.quantity}</span>
                <button
                  className={styles.quantityButton}
                  onClick={() => handleQuantityChange(cartItem.id, cartItem.type, cartItem.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className={styles.itemSubtotal}>
                {promoLabel ? (
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
                onClick={() => removeFromCart(cartItem.id, cartItem.type)}
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className={styles.cartFooter}>
          <div className={styles.total}>
            <span>Total Amount</span>
            <span>${totalPrice.toFixed(2)}</span>
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
