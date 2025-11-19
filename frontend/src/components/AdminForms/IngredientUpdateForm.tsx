import { useEffect, useId, useState, useMemo } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { IngredientUpdateFormSchema, IngredientUpdateFormValues } from "@/models/Ingredient";
import { useIngredientList, useUpdateIngredient } from "@/services/IngredientServices";

import styles from "./AdminForms.module.css";

type FieldError = { message: string };

const normalizeErrors = (errors: Array<{ message?: string } | undefined>): FieldError[] =>
  errors
    .map((error) => (error && error.message ? { message: error.message } : null))
    .filter((error): error is FieldError => error !== null);

const INGREDIENT_UPDATE_DEFAULT_VALUES: IngredientUpdateFormValues = {
  ingredientId: "",
  name: "",
  description: "",
};

type IngredientUpdateFormProps = {
  onClose: () => void;
  ingredientIdToUpdate?: number | null;
};

export const IngredientUpdateForm = ({ onClose, ingredientIdToUpdate }: IngredientUpdateFormProps) => {
  const updateIngredient = useUpdateIngredient();
  const ingredientsQuery = useIngredientList();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const ingredientSelectId = useId();

  const ingredients = useMemo(() => ingredientsQuery.data ?? [], [ingredientsQuery.data]);

  const formData = useAppForm({
    defaultValues: INGREDIENT_UPDATE_DEFAULT_VALUES,
    validators: {
      onChange: IngredientUpdateFormSchema,
    },
    onSubmit: async ({ value }) => {
        setSuccessMessage(null);
        const updatedIngredient = await updateIngredient.mutateAsync({
            id: Number(value.ingredientId),
            values: value,
        });
        setSuccessMessage(
            `Ingredient "${updatedIngredient?.name ?? value.name}" updated successfully.`
        );
    },
  });

  useEffect(() => {
    if (ingredientIdToUpdate && ingredients.length > 0) {
      const matchedIngredient = ingredients.find((i) => i.id === ingredientIdToUpdate);
      if (matchedIngredient) {
        formData.setFieldValue("ingredientId", matchedIngredient.id.toString());
        formData.setFieldValue("name", matchedIngredient.name ?? "");
        formData.setFieldValue("description", matchedIngredient.description ?? "");
      }
    }
  }, [ingredientIdToUpdate, ingredients, formData]);

  const submissionError = updateIngredient.error
    ? updateIngredient.error instanceof Error
      ? updateIngredient.error
      : new Error(String(updateIngredient.error))
    : null;

  if (ingredientsQuery.isLoading) {
    return (
      <section className={styles.formSection} aria-live="polite">
        Loading ingredients...
      </section>
    );
  }

  if (ingredientsQuery.error) {
    const errorMessage =
      ingredientsQuery.error instanceof Error
        ? ingredientsQuery.error.message
        : "Failed to load ingredients";
    return (
      <section className={styles.formSection} aria-live="assertive">
        <p>{errorMessage}</p>
      </section>
    );
  }

  if (ingredients.length === 0) {
    return (
      <section className={styles.formSection} aria-live="polite">
        <h2 className={styles.formTitle}>Update Ingredient</h2>
        <p>Add an ingredient first to enable updates.</p>
      </section>
    );
  }

  return (
    <section className={styles.formSection} aria-labelledby="ingredient-update-form-title">
      <h2 id="ingredient-update-form-title" className={styles.formTitle}>
        Update Ingredient
      </h2>
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.Field
            name="ingredientId"
            children={(field) => (
              <div className={styles.formFields}>
                <label className={styles.fieldLabel} htmlFor={ingredientSelectId}>
                  Ingredient
                </label>
                <select
                  id={ingredientSelectId}
                  className={styles.selectInput}
                  value={field.state.value}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.handleChange(value);

                    const matchedIngredient =
                      ingredients.find((ingredient) => ingredient.id.toString() === value) ?? null;

                    formData.setFieldValue("name", matchedIngredient?.name ?? "");
                    formData.setFieldValue("description", matchedIngredient?.description ?? "");
                    setSuccessMessage(null);
                  }}
                  onBlur={field.handleBlur}
                >
                  <option value="">Select an ingredient</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>
                <ErrorContainer
                  errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)}
                />
              </div>
            )}
          />

          <formData.AppField name="name" children={(field) => <field.TextField label="New name" />} />
          <formData.AppField name="description" children={(field) => <field.TextField label="New description" />} />

          <div className={styles.formActions}>
            <formData.Button label="Cancel" type="button" onClick={onClose} />
            <formData.Button label="Update Ingredient" />
          </div>
        </formData.FormContainer>
      </formData.AppForm>

      {successMessage ? <p className={styles.formMessage}>{successMessage}</p> : null}
    </section>
  );
};
