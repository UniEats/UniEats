import { useId, useState } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { ProductUpdateFormSchema, ProductUpdateFormValues } from "@/models/Product";
import { useProductList, useUpdateProduct } from "@/services/ProductServices";

import styles from "./AdminForms.module.css";
import { useMenuSectionList } from "@/services/MenuSectionServices";
import { useTagList } from "@/services/TagServices";
import { useIngredientList } from "@/services/IngredientServices";

type FieldError = { message: string };

const normalizeErrors = (errors: Array<{ message?: string } | undefined>): FieldError[] =>
  errors
    .map((error) => (error && error.message ? { message: error.message } : null))
    .filter((error): error is FieldError => error !== null);

const PRODUCT_UPDATE_DEFAULT_VALUES: ProductUpdateFormValues = {
  productId: "",
  name: "",
  description: "",
  price: "",
  ingredientIds: [],
  tagIds: [],
  menuSectionIds: [],
  image: null,
};

type ProductUpdateFormProps = {
  onClose: () => void;
};

export const ProductUpdateForm = ({ onClose }: ProductUpdateFormProps) => {
  const updateProduct = useUpdateProduct();
  const productsQuery = useProductList();
  const ingredientsQuery = useIngredientList();
  const tagsQuery = useTagList();
  const menuSectionsQuery = useMenuSectionList();
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
    },
  });

  const submissionError = updateProduct.error
    ? updateProduct.error instanceof Error
      ? updateProduct.error
      : new Error(String(updateProduct.error))
    : null;

  if (productsQuery.isLoading || ingredientsQuery.isLoading || tagsQuery.isLoading || menuSectionsQuery.isLoading) {
    return (
      <section className={styles.formSection} aria-live="polite">
        Loading products, ingredients, tags and menu sections...
      </section>
    );
  }

  if (productsQuery.error || ingredientsQuery.error || tagsQuery.error || menuSectionsQuery.error) {
    const productError = productsQuery.error;
    const ingredientError = ingredientsQuery.error;
    const tagError = tagsQuery.error;
    const menuError = menuSectionsQuery.error;
    const errorMessage =
      productError instanceof Error ? productError.message :
      ingredientError instanceof Error ? ingredientError.message :
      tagError instanceof Error ? tagError.message :
      menuError instanceof Error ? menuError.message :
      "Failed to load data";
    return (
      <section className={styles.formSection} aria-live="assertive">
        <p>{errorMessage}</p>
      </section>
    );
  }

  const products = productsQuery.data ?? [];
  const ingredients = ingredientsQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
  const menuSections = menuSectionsQuery.data ?? [];

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
                      formData.setFieldValue("price", matchedProduct?.price?.toString() ?? "");

                      formData.setFieldValue("ingredientIds", Object.keys(matchedProduct?.ingredients || {}));
                      formData.setFieldValue("tagIds", Object.keys(matchedProduct?.tags || {}));
                      formData.setFieldValue("menuSectionIds", Object.keys(matchedProduct?.menuSections || {}));
                   
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
                </div>
              );
            }}
          />
          <formData.AppField name="name" children={(field) => <field.TextField label="New name" />} />
          <formData.AppField
            name="description"
            children={(field) => <field.TextField label="New description" />}
          />
          <formData.AppField name="price" children={(field) => <field.TextField label="Price" />} />
          
          <formData.AppField
            name="ingredientIds"
            children={(field) => (
              <field.CheckboxField
                label="Ingredients"
                options={ingredients}
              />
            )}
          />

          <formData.AppField
            name="tagIds"
            children={(field) => (
              <field.CheckboxField
                label="Tags (optional)"
                options={tags}
                emptyMessage="No tags available yet."
              />
            )}
          />
          
          <formData.AppField
            name="menuSectionIds"
            children={(field) => (
              <field.CheckboxField
                label="Menu Sections"
                options={menuSections}
                emptyMessage="No menu sections available yet."
              />
            )}
          />

          <formData.AppField name="image" children={(field) => <field.FileField label="Image" />} />

          <div className={styles.formActions}>
            <formData.Button
              label="Cancel"
              type="button"
              onClick={onClose}
            />
            <formData.Button label="Add Item" />
          </div>
        </formData.FormContainer>
      </formData.AppForm>
      {successMessage ? <p className={styles.formMessage}>{successMessage}</p> : null}
    </section>
  );
};
