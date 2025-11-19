import { useEffect, useId, useMemo, useState } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { DayOfWeekSchema, PromotionUpdateFormSchema, PromotionUpdateFormValues } from "@/models/Promotion";
import { usePromotionList, useUpdatePromotion } from "@/services/PromotionServices";
import { useComboList } from "@/services/ComboServices";
import { useProductList } from "@/services/ProductServices";

import styles from "./AdminForms.module.css";

type FieldError = { message: string };

const normalizeErrors = (errors: Array<{ message?: string } | undefined>): FieldError[] =>
  errors
    .map((error) => (error && error.message ? { message: error.message } : null))
    .filter((error): error is FieldError => error !== null);

const PROMOTION_UPDATE_DEFAULT_VALUES: PromotionUpdateFormValues = {
  promotionId: "",
  name: "",
  description: "",
  type: "buyxpayy",
  active: true,
  productIds: [],
  comboIds: [],
  validDays: [],
  buyQuantity: 2,
  payQuantity: 1,
  percentage: undefined,
  threshold: undefined,
  discountAmount: undefined,
  freeProductIds: [],
  freeComboIds: [],
  oneFreePerTrigger: false,
};

const daysOfWeek = DayOfWeekSchema.options;

type PromotionUpdateFormProps = {
  onClose: () => void;
  promotionIdToUpdate?: number | null;
};

export const PromotionUpdateForm = ({ onClose, promotionIdToUpdate}: PromotionUpdateFormProps) => {
  const updatePromotion = useUpdatePromotion();
  const promotionsQuery = usePromotionList();
  const combosQuery = useComboList();
  const productsQuery = useProductList();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const promotionSelectId = useId();

  const promotions = useMemo(() => promotionsQuery.data ?? [], [promotionsQuery.data]);
  const combos = combosQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const formData = useAppForm({
    defaultValues: PROMOTION_UPDATE_DEFAULT_VALUES,
    validators: {
      onChange: PromotionUpdateFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      const updatedPromotion = await updatePromotion.mutateAsync(value);
      setSuccessMessage(`Promotion "${updatedPromotion.name}" updated successfully.`);
    },
  });

  useEffect(() => {
    if (promotionIdToUpdate && promotions.length > 0) {
      const promo = promotions.find((p) => p.id === promotionIdToUpdate);
      if (!promo) return;

      formData.setFieldValue("promotionId", String(promo.id));
      formData.setFieldValue("name", promo.name ?? "");
      formData.setFieldValue("description", promo.description ?? "");
      formData.setFieldValue("active", promo.active ?? false);

      const promotionType = promo.type.toLowerCase().replace(/_/g, "") as "buyxpayy" | "percentage" | "threshold" | "buygivefree";
      formData.setFieldValue("type", promotionType);

      formData.setFieldValue("productIds", promo.product?.map((p) => p.id) ?? []);

      formData.setFieldValue("comboIds", promo.combo?.map((c) => c.id) ?? []);

      formData.setFieldValue("validDays", promo.validDays ?? []);

      if (promo.type === "BUYX_PAYY") {
        formData.setFieldValue("buyQuantity", promo.buyQuantity);
        formData.setFieldValue("payQuantity", promo.payQuantity);
      }

      if (promo.type === "PERCENTAGE") {
        formData.setFieldValue("percentage", promo.percentage);
      }

      if (promo.type === "THRESHOLD") {
        formData.setFieldValue("threshold", promo.threshold);
        formData.setFieldValue("discountAmount", promo.discountAmount);
      }

      if (promo.type === "BUY_GIVE_FREE") {
        formData.setFieldValue("freeProductIds", promo.freeProducts?.map((f) => f.id) ?? []);
        formData.setFieldValue("freeComboIds", promo.freeCombos?.map((f) => f.id) ?? []);
        formData.setFieldValue("oneFreePerTrigger", promo.oneFreePerTrigger ?? false);
      }
    }
  }, [promotionIdToUpdate, promotions, formData]);

  const submissionError = updatePromotion.error
    ? updatePromotion.error instanceof Error
      ? updatePromotion.error
      : new Error(String(updatePromotion.error))
    : null;


  if (promotionsQuery.isLoading || combosQuery.isLoading || productsQuery.isLoading) {
    return (
      <section className={styles.formSection} aria-live="polite">
        Loading promotions...
      </section>
    );
  }

  if (promotionsQuery.error || combosQuery.error || productsQuery.error) {
    return (
      <section className={styles.formSection} aria-live="assertive">
        <p>Failed to load promotions or related data.</p>
      </section>
    );
  }

  if (promotions.length === 0) {
    return (
      <section className={styles.formSection}>
        <h2 className={styles.formTitle}>Update Promotion</h2>
        <p>Add a promotion first.</p>
      </section>
    );
  }

  return (
    <section className={styles.formSection} aria-labelledby="promotion-update-form-title">
      <h2 id="promotion-update-form-title" className={styles.formTitle}>
        Update Promotion
      </h2>

      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.Field
            name="promotionId"
            children={(field) => (
              <div className={styles.formFields}>
                <label className={styles.fieldLabel} htmlFor={promotionSelectId}>
                  Promotion
                </label>

                <select
                  id={promotionSelectId}
                  className={styles.selectInput}
                  value={field.state.value}
                  onChange={(e) => {
                    const id = e.target.value;
                    field.handleChange(id);
                    setSuccessMessage(null);

                    const promo = promotions.find((p) => p.id.toString() === id) ?? null;
                    if (!promo) return;

                    formData.setFieldValue("name", promo.name ?? "");
                    formData.setFieldValue("description", promo.description ?? "");
                    formData.setFieldValue("active", promo.active ?? false);

                    const promotionType = promo.type.toLowerCase().replace(/_/g, "") as "buyxpayy" | "percentage" | "threshold" | "buygivefree";
                    formData.setFieldValue("type", promotionType);

                    formData.setFieldValue("productIds", promo.product?.map((p) => p.id) ?? []);
                    formData.setFieldValue("comboIds", promo.combo?.map((c) => c.id) ?? []);
                    formData.setFieldValue("validDays", promo.validDays ?? []);

                    if (promo.type === "BUYX_PAYY") {
                       formData.setFieldValue("buyQuantity", promo.buyQuantity);
                       formData.setFieldValue("payQuantity", promo.payQuantity);
                    }

                    if (promo.type === "PERCENTAGE") {
                        formData.setFieldValue("percentage", promo.percentage);
                    }

                    if (promo.type === "THRESHOLD") {
                        formData.setFieldValue("threshold", promo.threshold);
                        formData.setFieldValue("discountAmount", promo.discountAmount);
                    }

                    if (promo.type === "BUY_GIVE_FREE") {
                        formData.setFieldValue("freeProductIds", promo.freeProducts?.map((f) => f.id) ?? []);
                        formData.setFieldValue("freeComboIds", promo.freeCombos?.map((f) => f.id) ?? []);
                        formData.setFieldValue("oneFreePerTrigger", promo.oneFreePerTrigger ?? false);
                    }
                  }}
                >
                  <option value="">Select a promotion</option>
                  {promotions.map((promo) => (
                    <option key={promo.id} value={promo.id}>
                      {promo.name}
                    </option>
                  ))}
                </select>

                <ErrorContainer
                  errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)}
                />
              </div>
            )}
          />

          <formData.AppField name="name" children={(field) => <field.TextField label="Name" />}/>
          <formData.AppField name="description" children={(field) => <field.TextField label="Description" />}/>
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
                label="Type"
                options={[
                  { value: "buyxpayy", label: "Buy X, Pay Y" },
                  { value: "percentage", label: "Percentage Discount" },
                  { value: "threshold", label: "Threshold Discount" },
                  { value: "buygivefree", label: "Buy X, Get Free" },
                ]}
              />
            )}
          />

          <formData.Subscribe selector={(s) => s.values.type}>
            {(type) => (
              <>
                {type === "buyxpayy" && (
                  <>
                    <formData.AppField
                      name="buyQuantity"
                      children={(field) => (
                        <field.TextField label="Buy Quantity" />
                      )}
                    />
                    <formData.AppField
                      name="payQuantity"
                      children={(field) => (
                        <field.TextField label="Pay Quantity" />
                      )}
                    />
                  </>
                )}

                {type === "percentage" && (
                  <formData.AppField
                    name="percentage"
                    children={(field) => (
                      <field.TextField label="Percentage" />
                    )}
                  />
                )}

                {type === "threshold" && (
                  <>
                    <formData.AppField
                      name="threshold"
                      children={(field) => (
                        <field.TextField label="Threshold" />
                      )}
                    />
                    <formData.AppField
                      name="discountAmount"
                      children={(field) => (
                        <field.TextField label="Discount Amount" />
                      )}
                    />
                  </>
                )}

                {type === "buygivefree" && (
                  <>
                    <formData.AppField
                      name="freeProductIds"
                      children={(field) => (
                        <field.CheckboxField
                          label="Free Products"
                          options={products.map((p) => ({
                            id: p.id,
                            value: p.id,
                            label: p.name,
                          }))}
                          searchable={true}
                        />
                      )}
                    />

                    <formData.AppField
                      name="freeComboIds"
                      children={(field) => (
                        <field.CheckboxField
                          label="Free Combos"
                          options={combos.map((c) => ({
                            id: c.id,
                            value: c.id,
                            label: c.name,
                          }))}
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

          <formData.AppField
            name="productIds"
            children={(field) => (
              <field.CheckboxField
                label="Products"
                options={products.map((p) => ({
                  id: p.id,
                  value: p.id,
                  label: p.name,
                }))}
                searchable={true}
              />
            )}
          />

          <formData.AppField
            name="comboIds"
            children={(field) => (
              <field.CheckboxField
                label="Combos"
                options={combos.map((c) => ({
                  id: c.id,
                  value: c.id,
                  label: c.name,
                }))}
                searchable={true}
              />
            )}
          />

          <formData.AppField
            name="validDays"
            children={(field) => (
              <field.CheckboxField
                label="Valid Days"
                  options={daysOfWeek.map((day, index) => ({
                    id: index,
                    value: index,
                    label: day[0] + day.slice(1).toLowerCase(),
                  }))}
              />
            )}
          />

          <div className={styles.formActions}>
            <formData.Button type="button" label="Cancel" onClick={onClose} />
            <formData.Button label="Save Changes" />
          </div>
        </formData.FormContainer>
      </formData.AppForm>

      {successMessage && (
        <p className={styles.formMessage}>{successMessage}</p>
      )}
    </section>
  );
};