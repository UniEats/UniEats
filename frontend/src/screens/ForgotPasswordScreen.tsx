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
            <div style={{ textAlign: "center" }}>
              <p
                className={`${styles.responseMessage} ${
                  data?.message === "Invalid email"
                    ? styles.error
                    : styles.success
                }`}
              >
                {data?.message}
              </p>

              {data?.message !== "Invalid email" && (
                <>
                  <p className={styles.infoText}>
                    Please check your email for the verification code.
                  </p>
                  <a href="/reset-password" className={styles.loginLink}>
                    Enter verification code
                  </a>
                </>
              )}
            </div>
          ) : (
            <>
              <p className={styles.instructionsText}>
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
