import { useState } from "react";

import { useAppForm } from "@/config/use-app-form";
import { IngredientCreateFormSchema, IngredientCreateFormValues } from "@/models/Ingredient";
import { useCreateIngredient } from "@/services/IngredientServices";

import styles from "./AdminForms.module.css";

const INGREDIENT_DEFAULT_VALUES: IngredientCreateFormValues = {
  name: "",
  description: "",
  stock: "",
};

type IngredientFormProps = {
  onClose: () => void;
};

export const IngredientForm = ({ onClose }: IngredientFormProps) => {
  const createIngredient = useCreateIngredient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formData = useAppForm({
    defaultValues: INGREDIENT_DEFAULT_VALUES,
    validators: {
      onChange: IngredientCreateFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      await createIngredient.mutateAsync(value);
      setSuccessMessage(`Ingredient "${value.name}" created successfully.`);
    },
  });

  const submissionError = createIngredient.error
    ? createIngredient.error instanceof Error
      ? createIngredient.error
      : new Error(String(createIngredient.error))
    : null;

  return (
    <section className={styles.formSection} aria-labelledby="ingredient-form-title">
      <h2 id="ingredient-form-title" className={styles.formTitle}>
        Add Ingredient
      </h2>
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.AppField name="name" children={(field) => <field.TextField label="Name" />} />
          <formData.AppField name="description" children={(field) => <field.TextField label="Description" />} />
          <formData.AppField name="stock" children={(field) => <field.TextField label="Initial stock" />} />

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
