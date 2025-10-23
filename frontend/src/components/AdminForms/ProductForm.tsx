import { useState } from "react";

import { useAppForm } from "@/config/use-app-form";
import { ProductFormSchema, ProductFormValues } from "@/models/Product";
import { useCreateProduct } from "@/services/ProductServices";
import { useIngredientList } from "@/services/IngredientServices";
import { useTagList } from "@/services/TagServices";
import { useMenuSectionList } from "@/services/MenuSectionServices";

import styles from "./AdminForms.module.css";

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
