import { useEffect, useState, useMemo, useId } from "react";
import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { PromotionUpdateFormValues, Promotion } from "@/models/Promotion";
import { useProductList } from "@/services/ProductServices";
import { useComboList } from "@/services/ComboServices";
import { usePromotionList, useUpdatePromotion } from "@/services/PromotionServices"; 

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
  active: false,
  productIds: [],
  comboIds: [],
  validDays: [],
  type: "buyxpayy",
  percentage: undefined,
  threshold: undefined,
  discountAmount: undefined,
  freeProductIds: [],
  freeComboIds: [],
  buyQuantity: undefined,
  payQuantity: undefined,
  oneFreePerTrigger: undefined,
};

type PromotionUpdateFormProps = {
  onClose: () => void;
  promotionIdToUpdate?: number | null;
};

export const PromotionUpdateForm = ({ onClose, promotionIdToUpdate }: PromotionUpdateFormProps) => {
  const updatePromotion = useUpdatePromotion();
  const promotionsQuery = usePromotionList();
  const productsQuery = useProductList();
  const combosQuery = useComboList();
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const promotionSelectId = useId();

  const promotions = useMemo(() => promotionsQuery.data ?? [], [promotionsQuery.data]);
  const products = productsQuery.data ?? [];
  const combos = combosQuery.data ?? [];

  const formData = useAppForm({
    defaultValues: PROMOTION_UPDATE_DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      const updatedPromotion = await updatePromotion.mutateAsync(value);
      setSuccessMessage(`Promotion "${updatedPromotion.name}" updated successfully.`);
    },
  });

  const weekDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const weekDaysOptions = weekDays.map((day, index) => ({
    id: index + 1,
    name: day,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setPromotionData = (promotion: Promotion | undefined, formData: any, weekDays: string[]) => {
    if (!promotion) return;

    formData.setFieldValue("promotionId", promotion.id.toString());
    formData.setFieldValue("name", promotion.name ?? "");
    formData.setFieldValue("description", promotion.description ?? "");
    formData.setFieldValue("active", promotion.active ?? false);
    formData.setFieldValue("validDays", (promotion.validDays || []).map((d) =>
      String(weekDays.indexOf(d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()) + 1)
    ));
    formData.setFieldValue("type", promotion.type.toLowerCase().replace(/_/g, '') as "threshold" | "percentage" | "buyxpayy" | "buygivefree");
    if (promotion.type === "BUY_GIVE_FREE") {
      formData.setFieldValue("productIds", (promotion?.product || []).map((p) => String(p.id)));
      formData.setFieldValue("freeProductIds", (promotion?.freeProducts || []).map((p) => String(p.id)));
      formData.setFieldValue("oneFreePerTrigger", promotion.oneFreePerTrigger);
    }
    
    formData.setFieldValue("productIds", (promotion?.product || []).map((p) => String(p.id)));
    formData.setFieldValue("comboIds", (promotion?.combo || []).map((c) => String(c.id)));

    if (promotion.type === "BUYX_PAYY") {
      formData.setFieldValue("buyQuantity", promotion.buyQuantity);
      formData.setFieldValue("payQuantity", promotion.payQuantity);
    } else if (promotion.type === "PERCENTAGE") {
      formData.setFieldValue("percentage", promotion.percentage);
    } else if (promotion.type === "THRESHOLD") {
      formData.setFieldValue("threshold", promotion.threshold);
      formData.setFieldValue("discountAmount", promotion.discountAmount);
    }
  };

  useEffect(() => {
    if (promotionIdToUpdate && promotions.length > 0) {
      const matchedPromotion = promotions.find((p) => p.id === promotionIdToUpdate);
      setPromotionData(matchedPromotion, formData, weekDays);
    }
  }, [weekDays, promotionIdToUpdate, promotions, formData]);

  const submissionError = updatePromotion.error ? updatePromotion.error : null;

  if (promotionsQuery.isLoading || productsQuery.isLoading || combosQuery.isLoading) {
    return <section className={styles.formSection}>Loading promotions, products, and combos...</section>;
  }

  return (
    <section className={styles.formSection}>
      <h2 className={styles.formTitle}>Update Promotion</h2>
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.Field
            name="promotionId"
            children={(field) => (
              <div className={styles.formFields}>
                <label htmlFor={promotionSelectId}>Promotion</label>
                <select
                  id={promotionSelectId}
                  value={field.state.value}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.handleChange(value);
                    const matchedPromotion = promotions.find((promotion) => promotion.id.toString() === value);
                    setPromotionData(matchedPromotion, formData, weekDays);
                    setSuccessMessage(null);
                  }}
                  onBlur={field.handleBlur}
                >
                  <option value="">Select a promotion</option>
                  {promotions.map((promotion) => (
                    <option key={promotion.id} value={promotion.id}>
                      {promotion.name}
                    </option>
                  ))}
                </select>

                <ErrorContainer
                  errors={normalizeErrors(field.state.meta.errors as Array<{ message?: string } | undefined>)}
                />
              </div>
            )}
          />
          
          <formData.AppField name="name" children={(field) => <field.TextField label="Promotion Name" />} />
          <formData.AppField name="description" children={(field) => <field.TextField label="Description" />} />
          <formData.AppField name="active" children={(field) => <field.BoolField label="Active" />} />
          <formData.AppField name="validDays" children={(field) => <field.CheckboxField label="Valid Days" options={weekDaysOptions} />}/>

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
                readonly={true}
              />
            )}
          />

          <formData.Subscribe selector={(s) => s.values.type}>
            {(type) => (
              <>
                {type !== "threshold" && (
                  <>
                    <formData.AppField name="productIds" children={(field) => <field.CheckboxField label="Products" options={products.map(product => ({id: product.id, label: product.name }))} />} />
                    <formData.AppField name="comboIds" children={(field) => <field.CheckboxField label="Combos" options={combos.map(combo => ({id: combo.id, label: combo.name }))} />} />
                  </>
              )}
              </>
            )}
          </formData.Subscribe>

          <formData.Subscribe selector={(s) => s.values.type}>
            {(type) => (
              <>
                {type === "buygivefree" && (
                  <>
                    <formData.AppField name="freeProductIds" children={(field) => <field.CheckboxField label="FreeProducts" options={products.map(product => ({id: product.id, label: product.name }))} />} />
                    <formData.AppField name="freeComboIds" children={(field) => <field.CheckboxField label="FreeCombos" options={combos.map(combo => ({id: combo.id, label: combo.name }))} />} />
          
                    <formData.AppField name="oneFreePerTrigger" children={(field) => <field.BoolField label="One Free Per Trigger" />} />
                  </>
                )}

                {type === "buyxpayy" && (
                  <>
                    <formData.AppField name="buyQuantity" children={(field) => <field.NumberField label="Buy Quantity" min={0} />} />
                    <formData.AppField name="payQuantity" children={(field) => <field.NumberField label="Pay Quantity" min={0} />} />
                  </>
                )}

                {type === "percentage" && (
                  <>
                    <formData.AppField name="percentage" children={(field) => <field.NumberField label="Discount Percentage" min={0} />} />
                  </>
                )}

                {type === "threshold" && (
                  <>
                    <formData.AppField name="threshold" children={(field) => <field.NumberField label="Threshold" min={0} />} />
                    <formData.AppField name="discountAmount" children={(field) => <field.NumberField label="Discount Amount" min={0} />} />
                  </>
                )}
              </>
            )}
          </formData.Subscribe>

          <div className={styles.formActions}>
            <formData.Button label="Cancel" type="button" onClick={onClose} />
            <formData.Button label="Update Promotion" />
          </div>
        </formData.FormContainer>
      </formData.AppForm>
      {successMessage && <p className={styles.formMessage}>{successMessage}</p>}
    </section>
  );
};
