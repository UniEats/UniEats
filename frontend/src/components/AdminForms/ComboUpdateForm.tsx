import { useId, useState } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { ComboFormValues, ComboUpdateFormSchema } from "@/models/Combo";
import { useComboList, useUpdateCombo } from "@/services/ComboServices";
import { useMenuSectionList } from "@/services/MenuSectionServices";
import { useProductList } from "@/services/ProductServices";
import { useTagList } from "@/services/TagServices";

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
  tagIds: [],
  menuSectionIds: [],
};

type ComboUpdateFormProps = {
  onClose: () => void;
};

export const ComboUpdateForm = ({ onClose }: ComboUpdateFormProps) => {
  const updateCombo = useUpdateCombo();
  const combosQuery = useComboList();
  const productsQuery = useProductList();
  const tagsQuery = useTagList();
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

  if (combosQuery.isLoading || productsQuery.isLoading || tagsQuery.isLoading || menuSectionsQuery.isLoading) {
    return (
      <section className={styles.formSection} aria-live="polite">
        Loading combos, products, tags and menu sections...
      </section>
    );
  }

  if (combosQuery.error || productsQuery.error || tagsQuery.error || menuSectionsQuery.error) {
    const comboError = combosQuery.error;
    const productError = productsQuery.error;
    const tagError = tagsQuery.error;
    const menuError = menuSectionsQuery.error;
    const errorMessage =
      comboError instanceof Error
        ? comboError.message
        : productError instanceof Error
          ? productError.message
          : tagError instanceof Error
            ? tagError.message
            : menuError instanceof Error
              ? menuError.message
              : "Failed to load data.";
    return (
      <section className={styles.formSection} aria-live="assertive">
        <p>{errorMessage}</p>
      </section>
    );
  }

  const combos = combosQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
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
                        (matchedCombo?.products || []).map((p) => ({ id: String(p.id), quantity: p.quantity })),
                      );
                      formData.setFieldValue("tagIds", Object.keys(matchedCombo?.tags || {}));
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

          <formData.AppField 
            name="productIds" 
            children={(field) => 
            <field.ItemQuantityField 
              label="Products" 
              items={products}
              emptyMessage="Please add products first." 
            />} 
          /> 

          <formData.AppField
            name="tagIds"
            children={(field) => (
              <field.CheckboxField
                label="Tags (optional)"
                options={tags}
                emptyMessage="No tags available yet."
                searchable={true}
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
                searchable={true}
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