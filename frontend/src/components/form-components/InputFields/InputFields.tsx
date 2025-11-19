import { useId } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useFieldContext } from "@/config/form-context";
import { useState } from 'react';

import styles from "./InputFields.module.css";

export const TextField = ({ label, readOnly }: { label: string, readOnly?: boolean }) => {
  return <FieldWithType type="text" label={label} readOnly={readOnly} />;
};

export const PasswordField = ({ label }: { label: string }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FieldWithType
      type={showPassword ? "text" : "password"}
      label={label}
      toggleShow={() => setShowPassword((prev) => !prev)}
      showPassword={showPassword}
    />
  );
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

const FieldWithType = ({ label, type, toggleShow, showPassword, readOnly, }: { label: string; type: string; toggleShow?: () => void; showPassword?: boolean; readOnly?: boolean; }) => {
  const id = useId();
  const field = useFieldContext<string>();

  const inputClass = readOnly ? `${styles.input} ${styles.inputReadOnly}` : styles.input;
  return (
    <>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      <div className={styles.dataContainer}>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            id={id}
            name={field.name}
            value={field.state.value}
            className={inputClass}
            type={type}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            readOnly={readOnly}
          />
          {toggleShow && !readOnly && (
            <button
              type="button"
              onClick={toggleShow}
              className={styles.showHideButton}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
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

export const CheckboxField = ({ label, options, emptyMessage, searchable = false }: CheckboxFieldProps & { searchable?: boolean }) => {
  const field = useFieldContext<string[]>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = searchQuery
    ? options.filter((option) =>
        [option.name, option.tag, option.label, option.description]
          .filter(Boolean)
          .some((text) =>
            text!.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : options;

  const noOptionsAvailable = options.length === 0;
  const noFilteredResults = options.length > 0 && filteredOptions.length === 0;

  return (
    <>
      <span className={styles.fieldLabel}>{label}</span>

      {searchable && (
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      )}

      <div className={styles.optionsGrid}>
        {noOptionsAvailable ? (
          <span className={styles.emptyMessage}>{emptyMessage ?? "No options available."}</span>
        ) : noFilteredResults ? (
          <span className={styles.emptyMessage}>No results found.</span>
        ) : (
          filteredOptions.map((option) => {
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
    </>
  );
};


type BoolFieldProps = {
  label: string;
};

export const BoolField = ({ label }: BoolFieldProps) => {
  const field = useFieldContext<boolean>();

  return (
    <>
      <div className={styles.boolField}>
        <span className={styles.fieldLabel}>{label}</span>
        <label className={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={field.state.value}
            onChange={(event) => field.handleChange(event.target.checked)}
            onBlur={field.handleBlur}
          />
          <span>{label}</span>
        </label>
        <ErrorContainer errors={field.state.meta.errors} />
      </div>
    </>
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

export const ItemQuantityField = ({ label, items, emptyMessage, searchable = false }: ItemQuantityFieldProps & { searchable?: boolean }) => {
  const field = useFieldContext<{ id: string; quantity: number }[]>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = searchQuery
    ? items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const noItemsAvailable = items.length === 0;
  const noFilteredResults = items.length > 0 && filteredItems.length === 0;

  return (
    <>
      <span className={styles.fieldLabel}>{label}</span>

      {searchable && (
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      )}

      {noItemsAvailable ? (
        <span className={styles.emptyMessage}>{emptyMessage ?? "No products available."}</span>
      ) : noFilteredResults ? (
        <span className={styles.emptyMessage}>No results found.</span>
      ) : (
        filteredItems.map((item) => {
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
    </>
  );
};

type SelectFieldProps = {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export const SelectField = ({ label, options, placeholder }: SelectFieldProps) => {
  const id = useId();
  const field = useFieldContext<string>();

  return (
    <>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>

      <select
        id={id}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        className={styles.selectInput}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <ErrorContainer errors={field.state.meta.errors} />
    </>
  );
};

type NumberFieldProps = { label: string; placeholder?: string; min?: number; max?: number; step?: number; };

export const NumberField = ({ label, placeholder = '', min, max, step = 1, }: NumberFieldProps) => {
  const field = useFieldContext<number>();

  return (
    <>
      <div className={styles.numberField}>
        <span className={styles.fieldLabel}>{label}</span>
        
        <input
          type="number"
          value={field.state.value ?? ''}
          onChange={(event) => field.handleChange(Number(event.target.value))}
          onBlur={field.handleBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={styles.input} 
        />
        
        <ErrorContainer errors={field.state.meta.errors} />
      </div>
    </>
  );
};
