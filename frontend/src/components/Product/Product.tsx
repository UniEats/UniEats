import { useUserRole } from "@/services/TokenContext";
import "./Product.css";
import { useEffect, useMemo, useState } from "react";
import { NormalizedPromotion } from "@/models/Promotion";

interface ProductProps {
  id: number;
  image?: Uint8Array;
  title: string;
  description: string;
  price: number;
  tags: string[];
  onDelete: (id: number) => void;
  onAddToCart?: (id: number, quantity: number) => void;
  available?: boolean;
  promotions?: NormalizedPromotion[];
}

const getImageUrl = (image?: Uint8Array) => {
  if (!image) return undefined;

  let buffer: ArrayBuffer;
  if (image instanceof Uint8Array) {
    buffer = image.slice().buffer as unknown as ArrayBuffer;
  } else if (typeof image === "object" && image !== null && "byteLength" in image) {
    buffer = new Uint8Array(image as ArrayBufferLike).slice().buffer as unknown as ArrayBuffer;
  } else {
    return undefined;
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

export default function Product({
  id,
  image,
  title,
  description,
  price,
  tags,
  onDelete,
  onAddToCart,
  available,
  promotions = [],
}: ProductProps) {
  const imageUrl = useMemo(() => getImageUrl(image), [image]);

  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const [showCartControls, setShowCartControls] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const userRole = useUserRole();

  const displayPrice = useMemo(() => {
    let calculatedPrice = price;

    promotions.forEach((promotion) => {
      if (promotion.type === "PERCENTAGE" && promotion.percentage) {
        calculatedPrice -= (calculatedPrice * promotion.percentage) / 100;
      }
    });

    return calculatedPrice;
  }, [price, promotions]);

  const giftNames = useMemo(() => {
    if (!promotions || promotions.length === 0) return [];

    const names: string[] = [];
    const appendNames = (items?: unknown) => {
      if (!items) return;

      if (Array.isArray(items)) {
        items.forEach((entry) => {
          if (typeof entry === "string") {
            names.push(entry);
          } else if (entry && typeof entry === "object" && "name" in entry) {
            const value = (entry as { name?: string }).name;
            if (value) names.push(value);
          }
        });
        return;
      }

      if (typeof items === "string") {
        names.push(items);
        return;
      }

      if (typeof items === "object") {
        Object.values(items as Record<string, string>).forEach((value) => {
          if (value) names.push(value);
        });
      }
    };

    promotions.forEach((promotion) => {
      if (promotion.type !== "BUY_GIVE_FREE") return;
      appendNames(promotion.freeProducts);
      appendNames(promotion.freeCombos);
    });

    return names;
  }, [promotions]);

  const promoLabels = useMemo(() => {
    if (!promotions || promotions.length === 0) return [];

    return promotions.map((promotion) => {
      if (promotion.type === "PERCENTAGE") return `-${promotion.percentage}%`;
      if (promotion.type === "BUYX_PAYY") return `${promotion.buyQuantity}x${promotion.payQuantity}`;
      if (promotion.type === "BUY_GIVE_FREE") return "GIFT";
      if (promotion.type === "THRESHOLD") return "DEAL";
      return "PROMO";
    });
  }, [promotions]);

  const handleAddClick = () => {
    setShowCartControls((prev) => !prev);
  };

  const handleConfirmAdd = () => {
    if (onAddToCart) onAddToCart(id, quantity);
    setShowCartControls(false);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) setQuantity(value);
  };

  return (
    <article className="product-card">
      <div
        className="product-badges-container"
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {promoLabels.map((label, index) => (
          <div key={`${id}-promo-${index}`} className="promo-badge" style={{ position: "static", marginBottom: 0 }}>
            {label}
          </div>
        ))}
      </div>
      <div className="product-media">
        <img className="product-image" src={imageUrl} alt={title} loading="lazy" />
      </div>
      <div className="product-body">
        <div className="product-content">
          <h3 className="product-title">{title}</h3>
          {giftNames.length > 0 && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "#10b981",
                fontWeight: "bold",
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>🎁 Includes: {giftNames.join(", ")}</span>
            </div>
          )}
          <p className="product-description">{description}</p>
          <div className="product-price-container">
            {displayPrice < price ? (
              <>
                <span className="original-price">${price.toFixed(2)}</span>
                <span className="discounted-price">${displayPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="product-price">${price.toFixed(2)}</span>
            )}
          </div>
          {tags.length > 0 ? (
            <ul className="product-tags" aria-label="Dietary tags">
              {tags.map((tag) => (
                <li key={tag} className="product-tag">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="product-actions">
          {userRole !== "ROLE_ADMIN" ? (
            available ? (
              <button
                className="product-cta"
                type="button"
                onClick={handleAddClick}
              >
                {showCartControls ? "Cancel" : "Add to cart"}
              </button>
            ) : (
              <button
                className="product-cta unavailable"
                type="button"
                disabled
              >
                Not available
              </button>
            )
          ) : (
            <>
              {onDelete && (
                <button
                  className="product-cta product-cta--delete"
                  type="button"
                  aria-label={`Delete ${title}`}
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete: "${title}"?`)) {
                      onDelete(id);
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 3V4H4V6H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V6H20V4H15V3H9ZM7 6H17V20H7V6ZM9 8V18H11V8H9ZM13 8V18H15V8H13Z" />
                  </svg>
                </button>
              ) } 
            </> )}
        </div>
        {showCartControls && (
          <div className="cart-controls">
            <label>
              Quantity:
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
              />
            </label>
            <p className="cart-total">
              Total: <strong>${(quantity * displayPrice).toFixed(2)}</strong>
            </p>
            <button
              className="product-cta product-cta--confirm"
              type="button"
              onClick={handleConfirmAdd}
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
