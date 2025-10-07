import { useState } from "react";

import { useAppForm } from "@/config/use-app-form";
import { TagFormSchema, TagFormValues } from "@/models/Tag";
import { useCreateTag } from "@/services/TagServices";

import styles from "./AdminForms.module.css";

const TAG_DEFAULT_VALUES: TagFormValues = {
  tag: "",
};

export const TagForm = () => {
  const createTag = useCreateTag();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formData = useAppForm({
    defaultValues: TAG_DEFAULT_VALUES,
    validators: {
      onChange: TagFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      await createTag.mutateAsync(value);
      setSuccessMessage(`Tag "${value.tag}" created successfully.`);
    },
  });

  const submissionError = createTag.error
    ? createTag.error instanceof Error
      ? createTag.error
      : new Error(String(createTag.error))
    : null;

  return (
    <section className={styles.formSection} aria-labelledby="tag-form-title">
      <h2 id="tag-form-title" className={styles.formTitle}>
        Add Tag
      </h2>
      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.AppField name="tag" children={(field) => <field.TextField label="Tag name" />} />
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelButton} onClick={() => window.history.back()}>
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
