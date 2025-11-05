import { useFormContext } from "@/config/form-context";
import styles from "./SubmitButton.module.css";

interface ButtonProps {
  label?: string;
  loadingMessage?: string;
  onClick?: () => void;
  type?: "submit" | "button";
  isPending?: boolean;
}

export const Button = ({
  label = "Submit",
  loadingMessage = "Loading...",
  onClick,
  type = "submit",
  isPending = false,
}: ButtonProps) => {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => (
        <button
          type={type}
          className={`${styles.button} ${
            type === "submit" ? styles.submitButton : styles.cancelButton
          }`}
          disabled={type === "submit" ? !canSubmit || isPending : false}
          onClick={onClick}
        >
          {type === "submit" && isSubmitting || isPending ? loadingMessage : label}
        </button>
      )}
    />
  );
};
