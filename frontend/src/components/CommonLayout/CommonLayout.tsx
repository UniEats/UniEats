import React, { useState } from "react"; // Removed useEffect and useMemo
import { Link } from "wouter";

import { useCart } from "@/components/Cart/Cart";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { CartModal } from "@/components/Cart/CartModal";
import { useToken, useUserRole } from "@/services/TokenContext";

import styles from "./CommonLayout.module.css";

export const CommonLayout = ({ children }: React.PropsWithChildren) => {
  const [tokenState, setTokenState] = useToken();
  const userRole = useUserRole();
  // consider the user authenticated only when tokens are fully loaded
  const isAuthenticated = tokenState.state === "LOGGED_IN";
  const handleLogout = () => {
    setTokenState({ state: "LOGGED_OUT" });
  };
  // We only need validItems for the cart badge count now
  const { validItems } = useCart();

  // This state and toggle function remain here to control the modal
  const [showCart, setShowCart] = useState(false);
  const toggleCart = () => setShowCart((prev) => !prev);

  return (
    <div className={styles.mainLayout}>
      <header className={styles.siteTopbar}>
        <Link href="/menu" className={styles.siteBrand} aria-label="University Cafeteria">
          University Cafeteria
        </Link>
        <nav className={styles.siteNav} aria-label="Primary navigation">
          {isAuthenticated ? (
            <>
              {userRole === "ROLE_ADMIN" && (
                <>
                  <Link href="/" className={styles.siteNavLink}>
                    Main Page
                  </Link>
                  <Link href="/menu" className={styles.siteNavLink}>
                    Menu
                  </Link>
                </>
              )}
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
          ) : (
            <>
              <a href="#" className={styles.siteNavLink}>
                Find a restaurant
              </a>
              <Link href="/menu" className={styles.siteNavLink}>
                Menu
              </Link>
              <a href="#" className={styles.siteNavLink}>
                Stories
              </a>
              <a href="#" className={styles.siteNavLink}>
                About
              </a>
              <a href="#" className={styles.siteNavLink}>
                Careers
              </a>
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
                  <button
                    type="button"
                    onClick={toggleCart}
                    className={`${styles.siteButton} ${styles.siteButtonCta}`}
                    aria-label="Go to cart"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10
                           0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zm-9.83-3h11.31
                           c.75 0 1.41-.41 1.75-1.03L23 6H6.21l-.94-2H1v2h3l3.6
                           7.59-1.35 2.44C5.16 16.37 5 16.68 5 17a2 2 0
                           0 0 2 2h12v-2H7l1.1-2z"
                      />
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
      {/* ALL THE MODAL LOGIC {showCart && <Modal>...} IS REMOVED FROM HERE */}
      <div className={styles.body}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterContent}>
          <p className={styles.siteFooterBrand}>University Cafeteria | Campus Dining Services</p>
          <p className={styles.siteFooterDisclaimer}>
            For dietary restrictions or allergen information, please speak with our staff
          </p>
        </div>
      </footer>

      {/* Render the new modal component here, passing in the state */}
      <CartModal show={showCart} onClose={toggleCart} />
    </div>
  );
};
