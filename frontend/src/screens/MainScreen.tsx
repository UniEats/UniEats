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

  const closeModal = useCallback(() => {
    setOpenModal(null);
  }, []);

  return (
    <CommonLayout>
      {role !== "ROLE_ADMIN" ? (
        <section className={styles.infoBox} aria-live="polite">
          <h2 className={styles.infoTitle}>Admin access required</h2>
          <p>Only administrators can create new ingredients, tags, and products.</p>
          <p>Please contact an administrator if you need changes made to the catalog.</p>
        </section>
      ) : (
        <>
          <div className={styles.actionsGrid}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                setOpenModal("ingredient");
              }}
            >
              Create ingredient
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                setOpenModal("tag");
              }}
            >
              Create tag
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                setOpenModal("product-create");
              }}
            >
              Create product
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                setOpenModal("product-update");
              }}
            >
              Update product
            </button>
          </div>

          {openModal === "ingredient" ? (
            <Modal onClose={closeModal} ariaLabelledBy="ingredient-form-title">
              <IngredientForm />
            </Modal>
          ) : null}

          {openModal === "tag" ? (
            <Modal onClose={closeModal} ariaLabelledBy="tag-form-title">
              <TagForm />
            </Modal>
          ) : null}

          {openModal === "product-create" ? (
            <Modal onClose={closeModal} ariaLabelledBy="product-form-title">
              <ProductForm />
            </Modal>
          ) : null}

          {openModal === "product-update" ? (
            <Modal onClose={closeModal} ariaLabelledBy="product-update-form-title">
              <ProductUpdateForm />
            </Modal>
          ) : null}
        </>
      )}
    </CommonLayout>
  );
};
