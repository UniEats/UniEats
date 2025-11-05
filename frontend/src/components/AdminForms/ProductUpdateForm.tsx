import { useId, useState } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { ProductUpdateFormSchema, ProductUpdateFormValues } from "@/models/Product";
import { useIngredientList } from "@/services/IngredientServices";
import { useMenuSectionList } from "@/services/MenuSectionServices";
import { useProductList, useUpdateProduct } from "@/services/ProductServices";
import { useTagList } from "@/services/TagServices";

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
      productError instanceof Error
        ? productError.message
        : ingredientError instanceof Error
          ? ingredientError.message
          : tagError instanceof Error
            ? tagError.message
            : menuError instanceof Error
              ? menuError.message
              : "Failed to load data";
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

                      const matchedProduct = products.find((product) => product.id.toString() === value) ?? null;

                      formData.setFieldValue("name", matchedProduct?.name ?? "");
                      formData.setFieldValue("description", matchedProduct?.description ?? "");
                      formData.setFieldValue("price", matchedProduct?.price?.toString() ?? "");
                      formData.setFieldValue(
                        "ingredientIds",
                        (matchedProduct?.ingredients || []).map((i) => ({ id: String(i.id), quantity: i.quantity })),
                      );
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
          <formData.AppField name="description" children={(field) => <field.TextField label="New description" />} />
          <formData.AppField name="price" children={(field) => <field.TextField label="Price" />} />
          <formData.Field
            name="ingredientIds"
            children={(field) => (
              <div className={styles.formFields}>
                <span className={styles.fieldLabel}>Ingredients</span>

                <div className={styles.optionsGrid}>
                  {ingredients.map((ingredient) => {
                    const selectedIngredient = field.state.value.find(
                      (i: { id: string; quantity: number }) => i.id === ingredient.id.toString(),
                    );
                    const quantity = selectedIngredient?.quantity ?? 1;

                    return (
                      <div key={ingredient.id} className={styles.optionRow}>
                        <input
                          type="checkbox"
                          checked={!!selectedIngredient}
                          onChange={(e) => {
                            let nextValue = [...field.state.value];
                            if (e.target.checked) {
                              nextValue.push({ id: ingredient.id.toString(), quantity });
                            } else {
                              nextValue = nextValue.filter(
                                (i: { id: string; quantity: number }) => i.id !== ingredient.id.toString(),
                              );
                            }
                            field.handleChange(nextValue);
                          }}
                        />
                        <span>{ingredient.name}</span>
                        {selectedIngredient && (
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => {
                              const nextValue = field.state.value.map((i: { id: string; quantity: number }) =>
                                i.id === ingredient.id.toString()
                                  ? { ...i, quantity: parseInt(e.target.value, 10) || 1 }
                                  : i,
                              );
                              field.handleChange(nextValue);
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <ErrorContainer
                  errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)}
                />
              </div>
            )}
          />
          <formData.Field
            name="tagIds"
            children={(field) => (
              <div className={styles.formFields}>
                <span className={styles.fieldLabel}>Tags (optional)</span>
                <div className={styles.optionsGrid}>
                  {tags.length === 0 ? (
                    <span>No tags available yet.</span>
                  ) : (
                    tags.map((tag) => {
                      const optionValue = tag.id.toString();
                      const isChecked = field.state.value.includes(optionValue);
                      return (
                        <label key={tag.id} className={styles.optionRow}>
                          <input
                            type="checkbox"
                            value={optionValue}
                            checked={isChecked}
                            onChange={(event) => {
                              const { checked, value } = event.target;
                              const nextValue = checked
                                ? [...field.state.value, value]
                                : field.state.value.filter((item) => item !== value);
                              field.handleChange(nextValue);
                            }}
                            onBlur={field.handleBlur}
                          />
                          <span>{tag.tag}</span>
                        </label>
                      );
                    })
                  )}
                </div>
                <ErrorContainer
                  errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)}
                />
              </div>
            )}
          />
          <formData.Field
            name="menuSectionIds"
            children={(field) => (
              <div className={styles.formFields}>
                <span className={styles.fieldLabel}>Menu Sections</span>
                <div className={styles.optionsGrid}>
                  {menuSections.length === 0 ? (
                    <span>No menu sections available yet.</span>
                  ) : (
                    menuSections.map((section) => {
                      const optionValue = section.id.toString();
                      const isChecked = field.state.value.includes(optionValue);
                      return (
                        <label key={section.id} className={styles.optionRow}>
                          <input
                            type="checkbox"
                            value={optionValue}
                            checked={isChecked}
                            onChange={(event) => {
                              const { checked, value } = event.target;
                              const nextValue = checked
                                ? [...field.state.value, value]
                                : field.state.value.filter((item) => item !== value);
                              field.handleChange(nextValue);
                            }}
                            onBlur={field.handleBlur}
                          />
                          <span>{section.label}</span>
                        </label>
                      );
                    })
                  )}
                </div>
                <ErrorContainer
                  errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)}
                />
              </div>
            )}
          />
          <formData.Field
            name="image"
            children={(field) => (
              <div>
                <label className={styles.fieldLabel} htmlFor="product-image">
                  Image
                </label>
                <input
                  id="product-image"
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const file = event.currentTarget.files ? (event.currentTarget.files[0] ?? null) : null;
                    field.handleChange(file);
                  }}
                />
                <ErrorContainer
                  errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)}
                />
              </div>
            )}
          />
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Update Item
            </button>
          </div>
        </formData.FormContainer>
      </formData.AppForm>
      {successMessage ? <p className={styles.formMessage}>{successMessage}</p> : null}
    </section>
  );
};
