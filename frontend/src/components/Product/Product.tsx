import { useUserRole } from "@/services/TokenContext";
import "./Product.css";
import { useEffect, useMemo, useState } from "react";

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

export default function Product({ id, image, title, description, price, tags, onDelete, onAddToCart, available }: ProductProps) {
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
      <div className="product-media">
        <img className="product-image" src={imageUrl} alt={title} loading="lazy" />
      </div>
      <div className="product-body">
        <div className="product-content">
          <h3 className="product-title">{title}</h3>
          <p className="product-description">{description}</p>
          <span className="product-price">${price}</span>
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
              Total: <strong>${(quantity * price).toFixed(2)}</strong>
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
