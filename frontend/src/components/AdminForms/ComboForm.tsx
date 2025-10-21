import { useState } from "react";
import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { ComboFormSchema, ComboFormValues } from "@/models/Combo";
import { useCreateCombo } from "@/services/ComboServices";
import { useProductList } from "@/services/ProductServices";
import { useTagList } from "@/services/TagServices";
import { useMenuSectionList } from "@/services/MenuSectionServices";

import styles from "./AdminForms.module.css";

type FieldError = { message: string };
const normalizeErrors = (errors: Array<{ message?: string } | undefined>): FieldError[] =>
  errors
    .map((error) => (error && error.message ? { message: error.message } : null))
    .filter((error): error is FieldError => error !== null);

const COMBO_DEFAULT_VALUES: ComboFormValues = {
  name: "",
  description: "",
  price: "",
  image: null,
  productIds: [],
  tagIds: [],
  menuSectionIds: [],
};

type ComboFormProps = {
  onClose: () => void;
};

export const ComboForm = ({ onClose }: ComboFormProps) => {
  const createCombo = useCreateCombo();
  const productsQuery = useProductList();
  const tagsQuery = useTagList();
  const menuSectionsQuery = useMenuSectionList()
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formData = useAppForm({
    defaultValues: COMBO_DEFAULT_VALUES,
    validators: { onChange: ComboFormSchema },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      await createCombo.mutateAsync(value);
      setSuccessMessage(`Combo "${value.name}" created successfully.`);
    },
  });

  const submissionError = createCombo.error
    ? createCombo.error instanceof Error
      ? createCombo.error
      : new Error(String(createCombo.error))
      : null;

  if (productsQuery.isLoading || tagsQuery.isLoading || menuSectionsQuery.isLoading) {
    return (
      <section className={styles.formSection} aria-live="polite">
        Loading products, tags and menu sections...
      </section>
    );
  }

  if (productsQuery.error || tagsQuery.error || menuSectionsQuery.error) {
    const productError = productsQuery.error;
    const tagError = tagsQuery.error;
    const menuError = menuSectionsQuery.error;
    const errorMessage =
       productError instanceof Error
          ? productError.message
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

  const products = productsQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
  const menuSections = menuSectionsQuery.data ?? [];

  return (
    <section className={styles.formSection} aria-labelledby="combo-form-title">
      <h2 id="combo-form-title" className={styles.formTitle}>
        Add Combo
      </h2>
      {products.length === 0 ? <p>Please add at least one product before creating a combo.</p> : null}
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.AppField name="name" children={(field) => <field.TextField label="Name" />} />
          <formData.AppField name="description" children={(field) => <field.TextField label="Description" />} />
          <formData.AppField name="price" children={(field) => <field.TextField label="Price" />} />

          <formData.Field
            name="productIds"
            children={(field) => (
              <div className={styles.formFields}>
                <span className={styles.fieldLabel}>Products</span>
                {products.map((product) => {
                  const selectedProduct = field.state.value.find((p: {id: string; quantity: number;}) => p.id === product.id.toString());
                  const quantity = selectedProduct?.quantity ?? 1;

                  return (
                    <div key={product.id} className={styles.optionRow}>
                      <input
                        type="checkbox"
                        checked={!!selectedProduct}
                        onChange={(e) => {
                          let nextValue = [...field.state.value];
                          if (e.target.checked) {
                            nextValue.push({ id: product.id.toString(), quantity });
                          } else {
                            nextValue = nextValue.filter((p: {id: string; quantity: number;}) => p.id !== product.id.toString());
                          }
                          field.handleChange(nextValue);
                        }}
                      />
                      <span>{product.name}</span>
                      {selectedProduct && (
                        <input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) => {
                            const nextValue = field.state.value.map((p: {id: string; quantity: number;}) =>
                              p.id === product.id.toString() ? { ...p, quantity: parseInt(e.target.value, 10) || 1 } : p
                            );
                            field.handleChange(nextValue);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
                <ErrorContainer errors={normalizeErrors(field.state.meta.errors)} />
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
                <label className={styles.fieldLabel} htmlFor="combo-image">
                  Image
                </label>
                <input
                  id="combo-image"
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.files?.[0] ?? null)}
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
              Add Combo
            </button>
          </div>
        </formData.FormContainer>
      </formData.AppForm>
      {successMessage ? <p className={styles.formMessage}>{successMessage}</p> : null}
    </section>
  );
};