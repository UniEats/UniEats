import { useId, useState } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { ComboUpdateFormSchema, ComboFormValues } from "@/models/Combo";
import { useComboList, useUpdateCombo } from "@/services/ComboServices";
import { useProductList } from "@/services/ProductServices";
import { useMenuSectionList } from "@/services/MenuSectionServices";

import styles from "./AdminForms.module.css";

type FieldError = { message: string };

const normalizeErrors = (errors: Array<{ message?: string } | undefined>): FieldError[] =>
  errors
    .map((error) => (error && error.message ? { message: error.message } : null))
    .filter((error): error is FieldError => error !== null);

const COMBO_UPDATE_DEFAULT_VALUES: ComboFormValues & { comboId: number } = {
  comboId: 0,
  name: "",
  description: "",
  price: "",
  image: null,
  productIds: [],
  menuSectionIds: [],
};

type ComboUpdateFormProps = {
  onClose: () => void;
};

export const ComboUpdateForm = ({ onClose }: ComboUpdateFormProps) => {
  const updateCombo = useUpdateCombo();
  const combosQuery = useComboList();
  const productsQuery = useProductList();
  const menuSectionsQuery = useMenuSectionList();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const comboSelectId = useId();

  const formData = useAppForm({
    defaultValues: COMBO_UPDATE_DEFAULT_VALUES,
    validators: {
      onChange: ComboUpdateFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      await updateCombo.mutateAsync(value);
      setSuccessMessage(`Combo "${value.name}" updated successfully.`);
    },
  });

  const submissionError = updateCombo.error
    ? updateCombo.error instanceof Error
      ? updateCombo.error
      : new Error(String(updateCombo.error))
    : null;

  if (combosQuery.isLoading || productsQuery.isLoading || menuSectionsQuery.isLoading) {
    return (
      <section className={styles.formSection} aria-live="polite">
        Loading combos, products and menu sections...
      </section>
    );
  }

  if (combosQuery.error || productsQuery.error || menuSectionsQuery.error) {
    const comboError = combosQuery.error;
    const productError = productsQuery.error;
    const menuError = menuSectionsQuery.error;
    const errorMessage =
      comboError instanceof Error ? comboError.message :
      productError instanceof Error ? productError.message :
      menuError instanceof Error ? menuError.message :
      "Failed to load data.";
    return (
      <section className={styles.formSection} aria-live="assertive">
        <p>{errorMessage}</p>
      </section>
    );
  }

  const combos = combosQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const menuSections = menuSectionsQuery.data ?? [];

  if (combos.length === 0) {
    return (
      <section className={styles.formSection} aria-live="polite">
        <h2 className={styles.formTitle}>Update Combo</h2>
        <p>Add a combo first to enable updates.</p>
      </section>
    );
  }

  return (
    <section className={styles.formSection} aria-labelledby="combo-update-form-title">
      <h2 id="combo-update-form-title" className={styles.formTitle}>
        Update Combo
      </h2>
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.Field
            name="comboId"
            children={(field) => {
              return (
                <div className={styles.formFields}>
                  <label className={styles.fieldLabel} htmlFor={comboSelectId}>
                    Combo
                  </label>
                  <select
                    id={comboSelectId}
                    className={styles.selectInput}
                    value={field.state.value}
                    onChange={(event) => {
                      const value = parseInt(event.target.value, 10);
                      field.handleChange(value);

                      const matchedCombo = combos.find((combo) => combo.id === value) ?? null;

                      formData.setFieldValue("name", matchedCombo?.name ?? "");
                      formData.setFieldValue("description", matchedCombo?.description ?? "");
                      formData.setFieldValue("price", matchedCombo?.price?.toString() ?? "");
                      formData.setFieldValue(
                        "productIds",
                        (matchedCombo?.products || []).map(p => ({ id: String(p.id), quantity: p.quantity }))
                      );
                      formData.setFieldValue("menuSectionIds", Object.keys(matchedCombo?.menuSections || {}));

                      setSuccessMessage(null);
                    }}
                    onBlur={field.handleBlur}
                  >
                    <option value="">Select a combo</option>
                    {combos.map((combo) => (
                      <option key={combo.id} value={combo.id}>
                        {combo.name}
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
              name="productIds"
              children={(field) => (
                <div className={styles.formFields}>
                  <span className={styles.fieldLabel}>Products</span>
                  {products.map((product) => {
                    const selectedProduct = field.state.value.find((p: any) => p.id === product.id.toString());
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
                              nextValue = nextValue.filter((p: any) => p.id !== product.id.toString());
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
                              const nextValue = field.state.value.map((p: any) =>
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
                  onChange={(event) => {
                    const file = event.currentTarget.files ? event.currentTarget.files[0] ?? null : null;
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
              Update Combo
            </button>
          </div>
        </formData.FormContainer>
      </formData.AppForm>
      {successMessage ? <p className={styles.formMessage}>{successMessage}</p> : null}
    </section>
  );
};