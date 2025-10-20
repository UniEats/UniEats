import { useAppForm } from "@/config/use-app-form";
import { LoginRequest, LoginRequestSchema } from "@/models/Login";
import styles from "../../screens/LoginScreen.module.css";

type Props = {
  onSubmit: (value: LoginRequest) => void;
  submitError: Error | null;
};

export function Login({ onSubmit, submitError }: Props) {
  const formData = useAppForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onChange: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => onSubmit(value),
  });

  return (
    <>
      <formData.AppForm>
        <formData.FormContainer extraError={submitError}>
          <formData.AppField
            name="username"
            children={(field) => <field.TextField label="Username" />}
          />

          <formData.AppField
            name="password"
            children={(field) => <field.PasswordField label="Password" />}
          />

          {/* Enlace para recuperar contraseña */}
          {/* Botón 'Olvidé mi contraseña' (no funcional por ahora) */}
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <button
              type="button"
              // onClick={() => {
              //   // ejemplo: para saber
              // }}
              className={styles.forgotButton}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit">Log In</button>
        </formData.FormContainer>
      </formData.AppForm>
    </>
  );
}
