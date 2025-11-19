import { useEffect, useState, useMemo, useId } from "react";
import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useAppForm } from "@/config/use-app-form";
import { /*PromotionUpdateFormSchema,*/ PromotionUpdateFormValues } from "@/models/Promotion";
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
    // validators: {
    //   onChange: PromotionUpdateFormSchema,
    // },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      console.log(value);
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

  useEffect(() => {
    if (promotionIdToUpdate && promotions.length > 0) {
      const matchedPromotion = promotions.find((p) => p.id === promotionIdToUpdate);
      if (matchedPromotion) {
        formData.setFieldValue("promotionId", matchedPromotion.id.toString());
        formData.setFieldValue("name", matchedPromotion.name ?? "");
        formData.setFieldValue("description", matchedPromotion.description ?? "");
        formData.setFieldValue("active", matchedPromotion.active ?? false);
        formData.setFieldValue("validDays", matchedPromotion.validDays ?? []);

        if (matchedPromotion.type === "BUY_GIVE_FREE") {
          formData.setFieldValue("productIds", matchedPromotion.product.map((p) => p.id));
          formData.setFieldValue("freeProductIds", matchedPromotion.freeProducts.map((p) => p.id));
        } else {
          formData.setFieldValue("productIds", matchedPromotion.product.map((p) => p.id));
        }

        formData.setFieldValue("comboIds", matchedPromotion.combo.map((c) => c.id));

        if (matchedPromotion.type === "BUYX_PAYY") {
          formData.setFieldValue("buyQuantity", matchedPromotion.buyQuantity);
          formData.setFieldValue("payQuantity", matchedPromotion.payQuantity);
        } else if (matchedPromotion.type === "PERCENTAGE") {
          formData.setFieldValue("percentage", matchedPromotion.percentage);
        } else if (matchedPromotion.type === "THRESHOLD") {
          formData.setFieldValue("threshold", matchedPromotion.threshold);
          formData.setFieldValue("discountAmount", matchedPromotion.discountAmount);
        }
      }
    }
  }, [promotionIdToUpdate, promotions, formData]);

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
                    formData.setFieldValue("name", matchedPromotion?.name ?? "");
                    formData.setFieldValue("description", matchedPromotion?.description ?? "");
                    formData.setFieldValue("active", matchedPromotion?.active ?? false);
                    formData.setFieldValue("validDays", matchedPromotion?.validDays ?? []);
                    formData.setFieldValue("productIds", matchedPromotion?.product.map((p) => p.id) ?? []);
                    formData.setFieldValue("comboIds", matchedPromotion?.combo.map((c) => c.id) ?? []);

                    if (matchedPromotion?.type === "BUY_GIVE_FREE") {
                      formData.setFieldValue("freeProductIds", matchedPromotion.freeProducts.map((p) => p.id));
                      formData.setFieldValue("freeComboIds", matchedPromotion.freeCombos.map((c) => c.id));
                      formData.setFieldValue("oneFreePerTrigger", matchedPromotion.oneFreePerTrigger);
                    } else {
                      formData.setFieldValue("freeProductIds", []);
                      formData.setFieldValue("freeComboIds", []);
                      formData.setFieldValue("oneFreePerTrigger", undefined);
                    }

                    if (matchedPromotion?.type === "BUYX_PAYY") {
                      formData.setFieldValue("buyQuantity", matchedPromotion.buyQuantity);
                      formData.setFieldValue("payQuantity", matchedPromotion.payQuantity);
                    } else {
                      formData.setFieldValue("buyQuantity", undefined);
                      formData.setFieldValue("payQuantity", undefined);
                    }

                    if (matchedPromotion?.type === "PERCENTAGE") {
                      formData.setFieldValue("percentage", matchedPromotion.percentage);
                    } else {
                      formData.setFieldValue("percentage", undefined);
                    }

                    if (matchedPromotion?.type === "THRESHOLD") {
                      formData.setFieldValue("threshold", matchedPromotion.threshold);
                      formData.setFieldValue("discountAmount", matchedPromotion.discountAmount);
                    } else {
                      formData.setFieldValue("threshold", undefined);
                      formData.setFieldValue("discountAmount", undefined);
                    }
                    
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
          <formData.AppField name="productIds" children={(field) => <field.CheckboxField label="Products" options={products.map(product => ({id: product.id, label: product.name }))} />} />
          <formData.AppField name="comboIds" children={(field) => <field.CheckboxField label="Combos" options={combos.map(combo => ({id: combo.id, label: combo.name }))} />} />
          
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
                {type === "buygivefree" && (
                  <>
                    <formData.AppField name="freeProductIds" children={(field) => <field.CheckboxField label="FreeProducts" options={products.map(product => ({id: product.id, label: product.name }))} />} />
                    <formData.AppField name="freeComboIds" children={(field) => <field.CheckboxField label="FreeCombos" options={combos.map(combo => ({id: combo.id, label: combo.name }))} />} />
          
                    <formData.AppField name="oneFreePerTrigger" children={(field) => <field.BoolField label="One Free Per Trigger" />} />
                  </>
                )}

                {type === "buyxpayy" && (
                  <>
                    <formData.AppField name="buyQuantity" children={(field) => <field.NumberField label="Buy Quantity" />} />
                    <formData.AppField name="payQuantity" children={(field) => <field.NumberField label="Pay Quantity" />} />
                  </>
                )}

                {type === "percentage" && (
                  <>
                    <formData.AppField name="percentage" children={(field) => <field.NumberField label="Discount Percentage" />} />
                  </>
                )}

                {type === "threshold" && (
                  <>
                    <formData.AppField name="threshold" children={(field) => <field.NumberField label="Threshold" />} />
                    <formData.AppField name="discountAmount" children={(field) => <field.NumberField label="Discount Amount" />} />                  </>
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
