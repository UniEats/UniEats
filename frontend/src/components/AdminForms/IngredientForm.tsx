import { useState } from "react";

import { useAppForm } from "@/config/use-app-form";
import { IngredientFormSchema, IngredientFormValues } from "@/models/Ingredient";
import { useCreateIngredient } from "@/services/IngredientServices";

import styles from "./AdminForms.module.css";

const INGREDIENT_DEFAULT_VALUES: IngredientFormValues = {
  name: "",
  description: "",
  stock: "",
};

export const IngredientForm = () => {
  const createIngredient = useCreateIngredient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formData = useAppForm({
    defaultValues: INGREDIENT_DEFAULT_VALUES,
    validators: {
      onChange: IngredientFormSchema,
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
        Create Ingredient
      </h2>
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.AppField name="name" children={(field) => <field.TextField label="Name" />} />
          <formData.AppField name="description" children={(field) => <field.TextField label="Description" />} />
          <formData.AppField name="stock" children={(field) => <field.TextField label="Initial stock" />} />
        </formData.FormContainer>
      </formData.AppForm>
      {successMessage ? <p className={styles.formMessage}>{successMessage}</p> : null}
    </section>
  );
};
