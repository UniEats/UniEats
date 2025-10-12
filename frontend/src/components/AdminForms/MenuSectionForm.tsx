import { useState } from "react";

import { useAppForm } from "@/config/use-app-form";
import { MenuSectionFormSchema, MenuSectionFormValues } from "@/models/MenuSection";
import { useCreateMenuSection } from "@/services/MenuSectionServices";

import styles from "./AdminForms.module.css";
import { MenuSectionList } from "./MenuSectionList";

const MENU_SECTION_DEFAULT_VALUES: MenuSectionFormValues = {
  label: "",
  description: "",
};

type MenuSectionFormProps = {
  onClose: () => void;
};

export const MenuSectionForm = ({ onClose }: MenuSectionFormProps) => {
  const createMenuSection = useCreateMenuSection();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formData = useAppForm({
    defaultValues: MENU_SECTION_DEFAULT_VALUES,
    validators: {
      onChange: MenuSectionFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      await createMenuSection.mutateAsync(value);
      setSuccessMessage(`Menu section "${value.label}" created successfully.`);
    },
  });

  const submissionError = createMenuSection.error
    ? createMenuSection.error instanceof Error
      ? createMenuSection.error
      : new Error(String(createMenuSection.error))
    : null;

  return (
    <section className={styles.formSection} aria-labelledby="menu-section-form-title">
      <h2 id="menu-section-form-title" className={styles.formTitle}>
        Add Menu Section
      </h2>

      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>

          <formData.AppField name="label">
            {(field) => <field.TextField {...field} label="Label" />}
          </formData.AppField>

          <formData.AppField name="description">
            {(field) => <field.TextField {...field} label="Description" />}
          </formData.AppField>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className={styles.submitButton}>
              Add Item
            </button>
          </div>

        </formData.FormContainer>
      </formData.AppForm>

      {successMessage && <p className={styles.formMessage}>{successMessage}</p>}
          <hr />
          <h3 style={{ margin: "0.5rem 0" }}>Existing menu sections</h3>
          <MenuSectionList />
    </section>
  );
};