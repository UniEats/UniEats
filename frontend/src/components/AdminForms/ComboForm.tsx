import { useState } from "react";
import { useAppForm } from "@/config/use-app-form";
import { ComboFormSchema, ComboFormValues } from "@/models/Combo";
import { useCreateCombo } from "@/services/ComboServices";
import { useMenuSectionList } from "@/services/MenuSectionServices";
import { useProductList } from "@/services/ProductServices";
import { useTagList } from "@/services/TagServices";

import styles from "./AdminForms.module.css";

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
  const menuSectionsQuery = useMenuSectionList();
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