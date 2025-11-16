import { useMemo } from "react";
import { Link } from "wouter";

import { Modal } from "@/components/Modal/Modal";
import { useProducts } from "@/components/Product/ProductContext";
import styles from "@/components/CommonLayout/CommonLayout.module.css";
import { useCart } from "./Cart";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/64";

// Helper function to create a safe Data URL from image byte data
const getImageUrl = (image: Uint8Array | undefined) => {
  if (!image) return PLACEHOLDER_IMAGE;

  let buffer: ArrayBuffer;
  if (image instanceof Uint8Array) {
    buffer = image.slice().buffer as ArrayBuffer;
  } else if (typeof image === "object" && image !== null && "byteLength" in image) {
    buffer = new Uint8Array(image as ArrayBufferLike).slice().buffer as ArrayBuffer;
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

  // Convert Uint8Array to a base64 string
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64String = window.btoa(binary);

  // Return a Data URL instead of a Blob URL
  return `data:${mimeType};base64,${base64String}`;
};

type CartModalProps = {
  show: boolean;
  onClose: () => void;
};

export const CartModal = ({ show, onClose }: CartModalProps) => {
  const { validItems, clearCart, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { productsMap, combosMap } = useProducts();

  const cartItems = useMemo(() => {
    return validItems
      .map((item) => {
        const data = item.type === "product" ? productsMap[item.id] : combosMap[item.id];
        if (!data) return null;

        const subtotal = data.price * item.quantity;
        const imageUrl = getImageUrl(data.image);

        return {
          key: `${item.type}-${item.id}`,
          item,
          data,
          subtotal,
          imageUrl,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }, [validItems, productsMap, combosMap]);

  if (!show) {
    return null;
  }

  return (
    <Modal onClose={onClose} ariaLabelledBy="cart-title">
      <h3 id="cart-title">Your Cart</h3>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul className={styles.cartItemList}>
            {cartItems.map(({ key, item, data, subtotal, imageUrl }) => (
              <li key={key} className={styles.cartItemCard}>
                <img src={imageUrl} alt={data.name} className={styles.cartItemImage} />
                <div className={styles.cartItemDetails}>
                  <span className={styles.cartItemName}>{data.name}</span>
                  <span className={styles.cartItemPrice}>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.cartItemControls}>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, item.type, Math.max(parseInt(e.target.value, 10) || 1, 1))
                    }
                    className={styles.cartQuantityInput}
                    aria-label={`Quantity for ${data.name}`}
                  />
                  <button
                    onClick={() => removeFromCart(item.id, item.type)}
                    className={styles.cartRemoveButton}
                    aria-label={`Remove ${data.name} from cart`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.cartFooter}>
            <p className={styles.cartTotal}>Total: ${totalPrice.toFixed(2)}</p>
            <div className={styles.cartActions}>
              <button onClick={clearCart} className={`${styles.siteButton} ${styles.siteButtonGhost}`}>
                Empty
              </button>
              {/* Note: Added onClick={onClose} to the Link to close the modal on navigation */}
              <Link href="/cart" onClick={onClose} className={`${styles.siteButton} ${styles.siteButtonCta}`}>
                Pay
              </Link>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};
