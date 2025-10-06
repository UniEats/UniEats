import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { IngredientForm } from "@/components/AdminForms/IngredientForm";
import { TagForm } from "@/components/AdminForms/TagForm";
import { ProductForm } from "@/components/AdminForms/ProductForm";
import { ProductUpdateForm } from "@/components/AdminForms/ProductUpdateForm";
import { useUserRole } from "@/services/TokenContext";

import styles from "./MainScreen.module.css";

export const MainScreen = () => {
  const role = useUserRole();

  return (
    <CommonLayout>
      {role !== "ROLE_ADMIN" ? (
        <section className={`${styles.infoBox} ${styles.fullWidth}`} aria-live="polite">
          <h2 className={styles.infoTitle}>Admin access required</h2>
          <p>Only administrators can create new ingredients, tags, and products.</p>
          <p>Please contact an administrator if you need changes made to the catalog.</p>
        </section>
      ) : (
        <div className={styles.wrapper}>
          <IngredientForm />
          <TagForm />
          <div className={styles.fullWidth}>
            <ProductForm />
          </div>
          <div className={styles.fullWidth}>
            <ProductUpdateForm />
          </div>
        </div>
      )}
    </CommonLayout>
  );
};
