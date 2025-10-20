import { useAppForm } from "@/config/use-app-form";
import { LoginRequest, LoginRequestSchema } from "@/models/Login";
import styles from "../../screens/LoginScreen.module.css";

type Props = {
  onSubmit: (value: LoginRequest) => void;
  submitError: Error | null;
};

export function Login({ onSubmit, submitError }: Props) {
  const formData = useAppForm({
    defaultValues: { username: "", password: "" },
    validators: { onChange: LoginRequestSchema },
    onSubmit: async ({ value }) => onSubmit(value),
  });

  const { AppForm, FormContainer, AppField } = formData;

  return (
    <AppForm>
      <FormContainer extraError={submitError}>
        <AppField name="username" children={(field) => <field.TextField label="Username" />} />
        <AppField name="password" children={(field) => <field.PasswordField label="Password" />} />

        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <a href="/forgot-password" className={styles.forgotButton}>
            Forgot password?
          </a>
        </div>

        <button type="submit">Log In</button>
      </FormContainer>
    </AppForm>
  );
}

