import React from "react";
import { Link } from "wouter";

import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { useToken } from "@/services/TokenContext";

import styles from "./CommonLayout.module.css";

export const CommonLayout = ({ children }: React.PropsWithChildren) => {
  const [tokenState, setTokenState] = useToken();
  const isAuthenticated = tokenState.state !== "LOGGED_OUT";

  const handleLogout = () => {
    setTokenState({ state: "LOGGED_OUT" });
  };

  return (
    <div className={styles.mainLayout}>
      <header className={styles.siteTopbar}>
        <Link href="/menu" className={styles.siteBrand} aria-label="University Cafeteria">
          University Cafeteria
        </Link>
        <nav className={styles.siteNav} aria-label="Primary navigation">
          {isAuthenticated ? (
            <>
              <Link href="/" className={styles.siteNavLink}>
                Main Page
              </Link>
              <Link href="/menu" className={styles.siteNavLink}>
                Menu
              </Link>
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
              <Link href="/menu" className={`${styles.siteButton} ${styles.siteButtonCta}`}>
                Order now
              </Link>
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
