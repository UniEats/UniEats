import React from "react";
import { Link } from "wouter";
import { useCart } from "@/components/Cart/Cart";
import { useProducts } from "@/components/Product/ProductContext";
import { useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { useToken, useUserRole } from "@/services/TokenContext";
import { Modal } from "@/components/Modal/Modal";

import styles from "./CommonLayout.module.css";

export const CommonLayout = ({ children }: React.PropsWithChildren) => {
  const [tokenState, setTokenState] = useToken();
  const userRole = useUserRole();
  // consider the user authenticated only when tokens are fully loaded
  const isAuthenticated = tokenState.state === "LOGGED_IN";
  const handleLogout = () => { setTokenState({ state: "LOGGED_OUT" }); };
  const { validItems, clearCart, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { productsMap, combosMap } = useProducts();
  const [showCart, setShowCart] = useState(false);
  const toggleCart = () => setShowCart(prev => !prev);

  return (
    <div className={styles.mainLayout}>
      <header className={styles.siteTopbar}>
        <Link href="/menu" className={styles.siteBrand} aria-label="University Cafeteria">
          University Cafeteria
        </Link>
        <nav className={styles.siteNav} aria-label="Primary navigation">
          {isAuthenticated && (
            <>
              {userRole === "ROLE_ADMIN" && (
              <>
                <Link href="/" className={styles.siteNavLink}>
                  Main Page
                </Link>
                <Link href="/menu" className={styles.siteNavLink}>
                  Menu
                </Link>
              </> )}
              {userRole === "ROLE_USER" && (
                <>
                  <Link href="/menu" className={styles.siteNavLink}>
                    Menu
                  </Link>
                  <Link href="/my-orders" className={styles.siteNavLink}>
                    My Orders
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
        <div className={styles.siteActions}>
          {isAuthenticated ? (
            <>
              <button type="button" onClick={handleLogout} className={`${styles.siteButton} ${styles.siteButtonGhost}`}>
                Log out
              </button>
              {userRole !== "ROLE_ADMIN" && userRole !== "ROLE_STAFF" && (
                <>
                  <button type="button" onClick={toggleCart} className={`${styles.siteButton} ${styles.siteButtonCta}`} aria-label="Go to cart">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10
                           0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zm-9.83-3h11.31
                           c.75 0 1.41-.41 1.75-1.03L23 6H6.21l-.94-2H1v2h3l3.6
                           7.59-1.35 2.44C5.16 16.37 5 16.68 5 17a2 2 0
                           0 0 2 2h12v-2H7l1.1-2z"/>
                    </svg>
                    {validItems.length > 0 && <span className={styles.cartBadge}>{validItems.length}</span>}
                  </button>
                </> 
              )}
            </>
          ) : (
            <>
              <Link href="/login" className={`${styles.siteButton} ${styles.siteButtonGhost}`}>
                Log in
              </Link>
              <Link href="/signup" className={`${styles.siteButton} ${styles.siteButtonCta}`}>
                Order now
              </Link>
            </>
          )}
        </div>
      </header>
      {showCart && (
        <Modal onClose={toggleCart} ariaLabelledBy="cart-title">
          <h3 id="cart-title">Your Cart</h3>
          {validItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <ul>
                {validItems.map(item => {
                  const data =
                    item.type === "product"
                      ? productsMap[item.id]
                      : combosMap[item.id];
                  if (!data) return null;
                  const subtotal = data.price * item.quantity;
                  return (
                    <li key={`${item.type}-${item.id}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                        alignItems: "center",
                      }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ flexShrink: 0 }}>{data.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, item.type, Math.max(parseInt(e.target.value, 10) || 1, 1))
                            }
                            style={{
                              width: "3rem",
                              textAlign: "center",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      </div>
                      <span style={{ minWidth: "80px", textAlign: "right" }}>
                        ${subtotal.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id, item.type)}
                        style={{ marginLeft: "1rem" }}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
              <hr />
                <p style={{ textAlign: "right", fontWeight: "bold" }}>
                  Total: ${totalPrice.toFixed(2)}
                </p>
                <div style={{ marginTop: "1rem", textAlign: "right" }}>
                    <Link href="/cart" className={`${styles.siteButton} ${styles.siteButtonCta}`}>
                      Pay
                    </Link>
                    <button onClick={clearCart} className={`${styles.siteButton} ${styles.siteButtonGhost}`} style={{ marginLeft: '0.5rem' }}>
                      Empty
                    </button>
                </div>
            </>
          )}
        </Modal>
      )}
      <div className={styles.body}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterContent}>
            <p className={styles.siteFooterBrand}>
                University Cafeteria | Campus Dining Services
            </p>
            <p className={styles.siteFooterDisclaimer}>
                For dietary restrictions or allergen information, please speak with our staff
            </p>
        </div>
      </footer>
    </div>
  );
};
