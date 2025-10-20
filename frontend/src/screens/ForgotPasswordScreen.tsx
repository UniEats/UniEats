import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { RequestResetSchema } from "@/models/PasswordReset";
import { useRequestPasswordReset } from "@/services/PasswordServices";
import styles from "./LoginScreen.module.css";

export const ForgotPasswordScreen = () => {
  const { mutate, error, isPending, isSuccess, data } = useRequestPasswordReset();

  const formData = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: RequestResetSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value); 
    },
  });

  const { AppForm, FormContainer, AppField } = formData;

  return (
    <CommonLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Recover Password</h1>

          {isSuccess && !error ? (
            <div style={{ textAlign: "center", color: "green" }}>
              <p>{data?.message || "Code sent successfully!"}</p>
              <p style={{ fontSize: "0.9rem", color: "#666", margin: "1rem 0" }}>
                Please check your email for the verification code.
              </p>
              <a href="/reset-password" className={styles.loginLink}>
                Enter verification code
              </a>
            </div>
          ) : (
            <>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.9rem",
                  color: "#666",
                  marginTop: "-1rem",
                  marginBottom: "1rem",
                }}
              >
                Enter your email to receive a verification code.
              </p>

              <AppForm>
                <FormContainer extraError={error}>
                  <AppField
                    name="email"
                    children={(field) => <field.TextField label="Email" />}
                  />
                  <button type="submit" disabled={isPending}>
                    {isPending ? "Sending..." : "Send Recovery Code"}
                  </button>
                </FormContainer>
              </AppForm>
            </>
          )}
        </div>
      </div>
    </CommonLayout>
  );
};
