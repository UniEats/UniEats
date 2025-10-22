import { useId } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useFieldContext } from "@/config/form-context";

import styles from "./InputFields.module.css";

export const TextField = ({ label }: { label: string }) => {
  return <FieldWithType type="text" label={label} />;
};

export const PasswordField = ({ label }: { label: string }) => {
  return <FieldWithType type="password" label={label} />;
};

export const FileField = ({ label }: { label: string }) => {
  const id = useId();
  const field = useFieldContext<File | null>();

  return (
    <>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.dataContainer}>
        <input
          id={id}
          name={field.name}
          className={styles.input}
          type="file"
          accept="image/*"
          onBlur={field.handleBlur}
          onChange={(e) => {
            const file = e.target.files ? e.target.files[0] ?? null : null;
            field.handleChange(file);
          }}
        />
        <ErrorContainer errors={field.state.meta.errors} />
      </div>
    </>
  );
};

const FieldWithType = ({ label, type }: { label: string; type: string }) => {
  const id = useId();
  const field = useFieldContext<string>();
  return (
    <>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.dataContainer}>
        <input
          id={id}
          name={field.name}
          value={field.state.value}
          className={styles.input}
          type={type}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
        <ErrorContainer errors={field.state.meta.errors} />
      </div>
    </>
  );
};
