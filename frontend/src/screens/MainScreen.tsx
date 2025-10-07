import { useCallback, useState } from "react";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { IngredientForm } from "@/components/AdminForms/IngredientForm";
import { TagForm } from "@/components/AdminForms/TagForm";
import { ProductForm } from "@/components/AdminForms/ProductForm";
import { ProductUpdateForm } from "@/components/AdminForms/ProductUpdateForm";
import { Modal } from "@/components/Modal/Modal";
import { useUserRole } from "@/services/TokenContext";
import styles from "./MainScreen.module.css";

export const MainScreen = () => {
  const role = useUserRole();
  const [openModal, setOpenModal] = useState<
    "ingredient" | "tag" | "product-create" | "product-update" | null
  >(null);

  const closeModal = useCallback(() => setOpenModal(null), []);

  if (role !== "ROLE_ADMIN") {
    return (
      <CommonLayout>
        <section className={styles.infoBox}>
          <h2 className={styles.infoTitle}>Admin access required</h2>
          <p>Only administrators can create new ingredients, tags, and products.</p>
          <p>Please contact an administrator if you need changes made to the catalog.</p>
        </section>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <section className={styles.adminPanel}>
        <h2 className={styles.panelTitle}>☕ Admin Control Panel</h2>
        <p className={styles.panelSubtitle}>
          Manage your café menu with ease
        </p>

        <div className={styles.buttonList}>
          <button
            className={styles.panelButton}
            onClick={() => setOpenModal("ingredient")}
          >
            <span className={styles.icon}>🥦</span>
            <span>Add Ingredient</span>
          </button>

          <button
            className={styles.panelButton}
            onClick={() => setOpenModal("tag")}
          >
            <span className={styles.icon}>🏷️</span>
            <span>Add Tag</span>
          </button>

          <button
            className={styles.panelButton}
            onClick={() => setOpenModal("product-create")}
          >
            <span className={styles.icon}>🍰</span>
            <span>Add Product</span>
          </button>

          <button
            className={styles.panelButton}
            onClick={() => setOpenModal("product-update")}
          >
            <span className={styles.icon}>🧾</span>
            <span>Update Product</span>
          </button>
        </div>
      </section>

      {openModal === "ingredient" && (
        <Modal onClose={closeModal}>
          <IngredientForm />
        </Modal>
      )}
      {openModal === "tag" && (
        <Modal onClose={closeModal}>
          <TagForm />
        </Modal>
      )}
      {openModal === "product-create" && (
        <Modal onClose={closeModal}>
          <ProductForm />
        </Modal>
      )}
      {openModal === "product-update" && (
        <Modal onClose={closeModal}>
          <ProductUpdateForm />
        </Modal>
      )}
    </CommonLayout>
  );
};
