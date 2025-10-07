import { useId, useState } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { ProductUpdateFormSchema, ProductUpdateFormValues } from "@/models/Product";
import { useProductList, useUpdateProduct } from "@/services/ProductServices";

import styles from "./AdminForms.module.css";

type FieldError = { message: string };

const normalizeErrors = (errors: Array<{ message?: string } | undefined>): FieldError[] =>
  errors
    .map((error) => (error && error.message ? { message: error.message } : null))
    .filter((error): error is FieldError => error !== null);

const PRODUCT_UPDATE_DEFAULT_VALUES: ProductUpdateFormValues = {
  productId: "",
  name: "",
  description: "",
};

export const ProductUpdateForm = () => {
  const updateProduct = useUpdateProduct();
  const productsQuery = useProductList();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const productSelectId = useId();

  const formData = useAppForm({
    defaultValues: PRODUCT_UPDATE_DEFAULT_VALUES,
    validators: {
      onChange: ProductUpdateFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      const updatedProduct = await updateProduct.mutateAsync(value);
      setSuccessMessage(`Product "${updatedProduct.name}" updated successfully.`);
      formData.setFieldValue("name", updatedProduct.name ?? "");
      formData.setFieldValue("description", updatedProduct.description ?? "");
    },
  });

  const submissionError = updateProduct.error
    ? updateProduct.error instanceof Error
      ? updateProduct.error
      : new Error(String(updateProduct.error))
    : null;

  if (productsQuery.isLoading) {
    return (
      <section className={styles.formSection} aria-live="polite">
        Loading products...
      </section>
    );
  }

  if (productsQuery.error) {
    const error = productsQuery.error;
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <section className={styles.formSection} aria-live="assertive">
        <p>{errorMessage}</p>
      </section>
    );
  }

  const products = productsQuery.data ?? [];

  if (products.length === 0) {
    return (
      <section className={styles.formSection} aria-live="polite">
        <h2 className={styles.formTitle}>Update Product</h2>
        <p>Add a product first to enable updates.</p>
      </section>
    );
  }

  return (
    <section className={styles.formSection} aria-labelledby="product-update-form-title">
      <h2 id="product-update-form-title" className={styles.formTitle}>
        Update Product
      </h2>
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.Field
            name="productId"
            children={(field) => {
              const currentProduct = field.state.value
                ? products.find((product) => product.id.toString() === field.state.value) ?? null
                : null;

              return (
                <div className={styles.formFields}>
                  <label className={styles.fieldLabel} htmlFor={productSelectId}>
                    Product
                  </label>
                  <select
                    id={productSelectId}
                    className={styles.selectInput}
                    value={field.state.value}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.handleChange(value);
                      const matchedProduct =
                        products.find((product) => product.id.toString() === value) ?? null;
                      formData.setFieldValue("name", matchedProduct?.name ?? "");
                      formData.setFieldValue("description", matchedProduct?.description ?? "");
                      setSuccessMessage(null);
                    }}
                    onBlur={field.handleBlur}
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <ErrorContainer
                    errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)}
                  />
                  {currentProduct ? (
                    <p className={styles.helperText}>Current description: {currentProduct.description}</p>
                  ) : null}
                </div>
              );
            }}
          />
          <formData.AppField name="name" children={(field) => <field.TextField label="New name" />} />
          <formData.AppField
            name="description"
            children={(field) => <field.TextField label="New description" />}
          />
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelButton} onClick={() => window.history.back()}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton}>
            Add Item
          </button>
        </div>
        </formData.FormContainer>
      </formData.AppForm>
      {successMessage ? <p className={styles.formMessage}>{successMessage}</p> : null}
    </section>
  );
};
