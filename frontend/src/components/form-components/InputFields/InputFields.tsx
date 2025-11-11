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
      <label htmlFor={id} className={styles.fieldLabel}>
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
      <label htmlFor={id} className={styles.fieldLabel}>
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

type CheckboxOption = {
  id: number;
  name?: string;
  tag?: string;
  label?: string;
  description?: string;
};

type CheckboxFieldProps = {
  label: string;
  options: CheckboxOption[];
  emptyMessage?: string;
};

export const CheckboxField = ({ label, options, emptyMessage }: CheckboxFieldProps) => {
  const field = useFieldContext<string[]>();

  return (
    <div className={styles.formFields}>
      <span className={styles.fieldLabel}>{label}</span>

      <div className={styles.optionsGrid}>
        {options.length === 0 ? (
          <span>{emptyMessage ?? "No options available."}</span>
        ) : (
          options.map((option) => {
            const optionValue = option.id.toString();
            const isChecked = field.state.value.includes(optionValue);

            return (
              <label key={option.id} className={styles.optionRow}>
                <input
                  type="checkbox"
                  value={optionValue}
                  checked={isChecked}
                  onChange={(event) => {
                    const { checked, value } = event.target;
                    const nextValue = checked
                      ? [...field.state.value, value]
                      : field.state.value.filter((item) => item !== value);
                    field.handleChange(nextValue);
                  }}
                  onBlur={field.handleBlur}
                />
                <span>
                  {option.name ?? option.tag ?? option.label}
                  {option.description ? ` – ${option.description}` : ""}
                </span>
              </label>
            );
          })
        )}
      </div>

      <ErrorContainer errors={field.state.meta.errors} />
    </div>
  );
};

type Item = {
  id: number;
  name: string;
};

type ItemQuantityFieldProps = {
  label: string;
  items: Item[];
  emptyMessage?: string;
};

export const ItemQuantityField = ({ label, items, emptyMessage }: ItemQuantityFieldProps) => {
  const field = useFieldContext<{ id: string; quantity: number }[]>();

  return (
    <div className={styles.formFields}>
      <span className={styles.fieldLabel}>{label}</span>

      {items.length === 0 ? (
        <span>{emptyMessage ?? "No products available."}</span>
      ) : (
        items.map((item) => {
          const selectedProduct = field.state.value.find((p) => p.id === item.id.toString());
          const quantity = selectedProduct?.quantity ?? 1;

          return (
            <label key={item.id} className={styles.optionRowWithQuantity}>
              <input
                type="checkbox"
                checked={!!selectedProduct}
                onChange={(e) => {
                  let nextValue = [...field.state.value];
                  if (e.target.checked) {
                    nextValue.push({ id: item.id.toString(), quantity });
                  } else {
                    nextValue = nextValue.filter((p) => p.id !== item.id.toString());
                  }
                  field.handleChange(nextValue);
                }}
                onBlur={field.handleBlur}
              />
              <span>{item.name}</span>
              {selectedProduct && (
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    const nextValue = field.state.value.map((p) =>
                      p.id === item.id.toString() ? { ...p, quantity: val } : p
                    );
                    field.handleChange(nextValue);
                  }}
                  onBlur={field.handleBlur}
                  className={styles.quantityInput}
                />
              )}
            </label>
          );
        })
      )}

      <ErrorContainer errors={field.state.meta.errors} />
    </div>
  );
};
