import { useEffect, useState, useId } from "react";
import { useAppForm } from "@/config/use-app-form";
import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useIngredientList, useIncreaseStockIngredient } from "@/services/IngredientServices";
import { IngredientIncreaseStockSchema, IngredientIncreaseStockFormValues } from "@/models/Ingredient";
import styles from "./AdminForms.module.css";

type FieldError = { message: string };

const normalizeErrors = (errors: Array<{ message?: string } | undefined>): FieldError[] =>
  errors
    .map((error) => (error && error.message ? { message: error.message } : null))
    .filter((error): error is FieldError => error !== null);

const INGREDIENT_INCREASE_STOCK_DEFAULT_VALUES : IngredientIncreaseStockFormValues = {
  ingredientId: "",
  name: "",
  description: "",
  stockAmount: 0,
};

type IngredientIncreaseStockFormProps = {
  onClose: () => void;
  ingredientIdToIncreaseStock?: number | null;
};

export const IngredientIncreaseStockForm = ({
  onClose,
  ingredientIdToIncreaseStock,
}: IngredientIncreaseStockFormProps) => {
  const increaseStock = useIncreaseStockIngredient();
  const ingredientsQuery = useIngredientList();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const ingredientSelectId = useId();

  const ingredients = ingredientsQuery.data ?? [];

  const formData = useAppForm({
    defaultValues: INGREDIENT_INCREASE_STOCK_DEFAULT_VALUES,
    validators: {
      onChange: IngredientIncreaseStockSchema,
    },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      const { ingredientId, stockAmount } = value;
      const increasedStockIngredient = await increaseStock.mutateAsync({
        id: Number(ingredientId),
        amount: stockAmount,
      });
      setSuccessMessage(`Ingredient "${increasedStockIngredient.name}" stock increased successfully.`);
    },
  });

  useEffect(() => {
    if (ingredientIdToIncreaseStock && ingredients.length > 0) {
      const matchedProduct = ingredients.find((p) => p.id === ingredientIdToIncreaseStock);

      if (matchedProduct) {
        formData.setFieldValue("ingredientId", matchedProduct.id.toString());
        formData.setFieldValue("name", matchedProduct.name ?? "");
        formData.setFieldValue("description", matchedProduct.description ?? "");
      }
    }
  }, [ingredientIdToIncreaseStock, ingredients, formData]);

  const submissionError = increaseStock.error
    ? increaseStock.error instanceof Error
      ? increaseStock.error
      : new Error(String(increaseStock.error))
    : null;

  return (
    <section className={styles.formSection} aria-labelledby="ingredient-increase-stock-form-title">
      <h2 id="ingredient-increase-stock-form-title" className={styles.formTitle}>
        Increase Stock for Ingredient
      </h2>
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.Field
            name="ingredientId"
            children={(field) => {
              return (
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

                      const matchedProduct = ingredients.find((ingredient) => ingredient.id.toString() === value) ?? null;

                      formData.setFieldValue("name", matchedProduct?.name ?? "");
                      formData.setFieldValue("description", matchedProduct?.description ?? "");
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
              );
            }}
          />
          
          <formData.AppField name="name" children={(field) => <field.TextField label="Name" readOnly={true} />} />
          <formData.AppField name="description" children={(field) => <field.TextField label="Description" readOnly={true} />} />
          
          <formData.AppField name="stockAmount" children={(field) => (
            <>  
              <label className={styles.fieldLabel} htmlFor="stockAmount">
                Amount to Increase
              </label>
              <div className={styles.dataContainer}>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    id="stockAmount"
                    type="number"
                    min="0"
                    value={field.state.value || 0}
                    onChange={(event) => {
                      const newValue = Math.max(1, Number(event.target.value));
                      field.handleChange(newValue);
                    }}
                    className={styles.inputField}
                    />
                </div>
                <ErrorContainer
                  errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)}
                  />
              </div>
            </>
          )} />

          <div className={styles.formActions}>
            <formData.Button label="Cancel" type="button" onClick={onClose} />
            <formData.Button label="Increase Stock" />
          </div>
        </formData.FormContainer>
      </formData.AppForm>

      {successMessage && <p className={styles.formMessage}>{successMessage}</p>}
    </section>
  );
};
