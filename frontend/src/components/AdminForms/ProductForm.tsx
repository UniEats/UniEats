import { useState } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { ProductFormSchema, ProductFormValues } from "@/models/Product";
import { useCreateProduct } from "@/services/ProductServices";
import { useIngredientList } from "@/services/IngredientServices";
import { useTagList } from "@/services/TagServices";
import { useMenuSectionList } from "@/services/MenuSectionServices";

import styles from "./AdminForms.module.css";

type FieldError = { message: string };

const normalizeErrors = (errors: Array<{ message?: string } | undefined>): FieldError[] =>
  errors
    .map((error) => (error && error.message ? { message: error.message } : null))
    .filter((error): error is FieldError => error !== null);

const PRODUCT_DEFAULT_VALUES: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  ingredientIds: [],
  tagIds: [],
  menuSectionIds: [],
  image: null,
};

type ProductFormProps = {
  onClose: () => void;
};

export const ProductForm = ({ onClose }: ProductFormProps) => {
  const createProduct = useCreateProduct();
  const ingredientsQuery = useIngredientList();
  const tagsQuery = useTagList();
  const menuSectionsQuery = useMenuSectionList()
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formData = useAppForm({
    defaultValues: PRODUCT_DEFAULT_VALUES,
    validators: {
      onChange: ProductFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      await createProduct.mutateAsync(value);
      setSuccessMessage(`Product "${value.name}" created successfully.`);
    },
  });

  const submissionError = createProduct.error
    ? createProduct.error instanceof Error
      ? createProduct.error
      : new Error(String(createProduct.error))
    : null;

  if (ingredientsQuery.isLoading || tagsQuery.isLoading || menuSectionsQuery.isLoading) {
    return (
      <section className={styles.formSection} aria-live="polite">
        Loading ingredients, tags and menu sections...
      </section>
    );
  }

  if (ingredientsQuery.error || tagsQuery.error || menuSectionsQuery.error) {
    const ingredientError = ingredientsQuery.error;
    const tagError = tagsQuery.error;
    const menuError = menuSectionsQuery.error;
    const errorMessage =
        ingredientError instanceof Error
          ? ingredientError.message
          : tagError instanceof Error
          ? tagError.message
          : menuError instanceof Error
          ? menuError.message
          : "Failed to load required data.";
    return (
      <section className={styles.formSection} aria-live="assertive">
        <p>{errorMessage}</p>
      </section>
    );
  }

  const ingredients = ingredientsQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
  const menuSections = menuSectionsQuery.data ?? [];

  return (
    <section className={styles.formSection} aria-labelledby="product-form-title">
      <h2 id="product-form-title" className={styles.formTitle}>
        Add Product
      </h2>
      {ingredients.length === 0 ? <p>Please add at least one ingredient before creating a product.</p> : null}
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.AppField name="name" children={(field) => <field.TextField label="Name" />} />
          <formData.AppField name="description" children={(field) => <field.TextField label="Description" />} />
          <formData.AppField name="price" children={(field) => <field.TextField label="Price" />} />
          <formData.Field
            name="ingredientIds"
            children={(field) => (
              <div className={styles.formFields}>
                <span className={styles.fieldLabel}>Ingredients</span>
                <div className={styles.optionsGrid}>
                  {ingredients.map((ingredient) => {
                    const optionValue = ingredient.id.toString();
                    const isChecked = field.state.value.includes(optionValue);
                    return (
                      <label key={ingredient.id} className={styles.optionRow}>
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
                        <span>
                          {ingredient.name}
                          {ingredient.description ? ` – ${ingredient.description}` : ""}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <ErrorContainer errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)} />
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
                <ErrorContainer errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)} />
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
                <ErrorContainer errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)} />
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
                    const file = event.currentTarget.files ? event.currentTarget.files[0] ?? null : null;
                    field.handleChange(file);
                  }}
                />
                <ErrorContainer errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)} />
              </div>
            )}
          />
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
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
