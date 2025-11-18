import { useState } from "react";
import { useAppForm } from "@/config/use-app-form";
import { PromotionFormSchema, PromotionFormValues, DayOfWeekSchema } from "@/models/Promotion";
import { useCreatePromotion } from "@/services/PromotionServices";
import { useComboList } from "@/services/ComboServices";
import { useProductList } from "@/services/ProductServices";

import styles from "./AdminForms.module.css";

const PROMOTION_DEFAULT_VALUES: PromotionFormValues = {
    name: "",
    description: "",
    productIds: [],
    comboIds: [],
    validDays: [],
    type: "buyxpayy",
    buyQuantity: 2,
    payQuantity: 1,
    percentage: undefined,
    threshold: undefined,
    discountAmount: undefined,
    active: true,
    oneFreePerTrigger: false,
    freeProductIds: [],
    freeComboIds: [],
};

const daysOfWeek = DayOfWeekSchema.options;

type PromotionFormProps = {
onClose: () => void;
};

export const PromotionForm = ({ onClose }: PromotionFormProps) => {
  const createPromotion = useCreatePromotion();
  const combosQuery = useComboList();
  const productsQuery = useProductList();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formData = useAppForm({
    defaultValues: PROMOTION_DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
        const submissionData = {
          ...value,
          active: !!value.active,
          oneFreePerTrigger: !!value.oneFreePerTrigger,
        };

    const validated = PromotionFormSchema.parse(submissionData);
    await createPromotion.mutateAsync(validated);
    setSuccessMessage(`Promotion "${value.name}" created successfully.`);
    },
  });


  const submissionError = createPromotion.error
    ? createPromotion.error instanceof Error
      ? createPromotion.error
      : new Error(String(createPromotion.error))
    : null;

  if (combosQuery.isLoading || productsQuery.isLoading) {
    return (
      <section className={styles.formSection} aria-live="polite">
        <p>Loading form...</p>
      </section>
    );
  }

  if (combosQuery.error || productsQuery.error) {
    const comboError = combosQuery.error;
    const productError = productsQuery.error;
    const errorMessage =
      comboError instanceof Error
        ? comboError.message
        : productError instanceof Error
          ? productError.message
            : "Failed to load required data.";
    return (
      <section className={styles.formSection} aria-live="assertive">
        <p>{errorMessage}</p>
      </section>
    );
  }

  const combos = combosQuery.data ?? [];
  const products = productsQuery.data ?? [];

  return (
    <section className={styles.formSection} aria-labelledby="promotion-form-title">
      <h2 id="promotion-form-title" className={styles.formTitle}>
        Add Promotion
      </h2>
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.AppField name="name" children={(field) => <field.TextField label="Name" />} />
          <formData.AppField name="description" children={(field) => <field.TextField label="Description" />} />

          <formData.AppField name="active">
            {(field) => (
              <label className={styles.optionRow}>
                <input
                  type="checkbox"
                  checked={Boolean(field.state.value)}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  onBlur={field.handleBlur}
                />
                <span>Active?</span>
              </label>
            )}
          </formData.AppField>

          <formData.AppField
            name="type"
            children={(field) => (
              <field.SelectField
                label="Promotion Type"
                options={[
                  { value: "buyxpayy", label: "Buy X, Pay Y" },
                  { value: "percentage", label: "Percentage Discount" },
                  { value: "threshold", label: "Threshold Discount" },
                  { value: "buygivefree", label: "Buy X, Get Y Free"}
                ]}
              />
            )}
          />

          <formData.Subscribe selector={(state) => state.values.type}>
            {(selectedType) => (
              <>
                {selectedType === "buyxpayy" && (
                  <>
                    <formData.AppField name="buyQuantity" children={(field) => <field.TextField label="Buy Quantity" />} />
                    <formData.AppField name="payQuantity" children={(field) => <field.TextField label="Pay Quantity" />} />
                  </>
                )}

                {selectedType === "percentage" && (
                  <formData.AppField name="percentage" children={(field) => <field.TextField label="Percentage (%)" />} />
                )}

                {selectedType === "threshold" && (
                  <>
                    <formData.AppField name="threshold" children={(field) => <field.TextField label="Minimum Purchase ($)" />} />
                    <formData.AppField name="discountAmount" children={(field) => <field.TextField label="Discount Amount ($)" />} />
                  </>
                )}
                {selectedType === "buygivefree" && (
                  <>
                      <formData.AppField name="freeProductIds" children={(field) => (
                          <field.CheckboxField
                          label="Free Products"
                          options={products.map(p => ({ id: p.id, value: p.id, label: p.name }))}
                          searchable={true}
                          />
                          )}
                          />

                      <formData.AppField name="freeComboIds" children={(field) => (
                          <field.CheckboxField
                          label="Free Combos"
                          options={combos.map(c => ({ id: c.id, value: c.id, label: c.name }))}
                          searchable={true}
                          />
                          )}
                          />

                      <formData.AppField name="oneFreePerTrigger">
                        {(field) => (
                          <label className={styles.optionRow}>
                            <input
                              type="checkbox"
                              checked={Boolean(field.state.value)}
                              onChange={(e) => field.handleChange(e.target.checked)}
                              onBlur={field.handleBlur}
                            />
                            <span>One free per trigger</span>
                          </label>
                        )}
                      </formData.AppField>
                  </>
                )}
              </>
            )}
          </formData.Subscribe>

          <formData.Subscribe selector={(state) => state.values.type}>
            {(selectedType) => (
              <>
                {selectedType !== "threshold" && (
                  <>
                    <formData.AppField
                      name="comboIds"
                      children={(field) =>
                        <field.CheckboxField
                          label="Applicable Combos"
                          options={combos.map(c => ({
                            id: c.id,
                            value: c.id,
                            label: c.name
                          }))}
                          searchable={true}
                        />}
                    />

                    <formData.AppField
                      name="productIds"
                      children={(field) =>
                        <field.CheckboxField
                          label="Applicable Products"
                          options={products.map(p => ({
                            id: p.id,
                            value: p.id,
                            label: p.name
                          }))}
                          searchable={true}
                        />}
                    />
                  </>
                )}
              </>
            )}
          </formData.Subscribe>

          <formData.AppField
            name="validDays"
            children={(field) => (
              <field.CheckboxField
                label="Active Days (Optional)"
                  options={daysOfWeek.map((day, index) => ({
                    id: index,
                    value: index,
                    label: day[0] + day.slice(1).toLowerCase(),
                  }))}
              />
            )}
          />

          <div className={styles.formActions}>
            <formData.Button
              label="Cancel"
              type="button"
              onClick={onClose}
            />
            <formData.Button label="Add Promotion" />
          </div>
        </formData.FormContainer>
      </formData.AppForm>
      {successMessage ? <p className={styles.formMessage}>{successMessage}</p> : null}
    </section>
  );
};




