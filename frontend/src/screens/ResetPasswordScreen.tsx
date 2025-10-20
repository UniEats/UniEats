import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { ResetPasswordRequest, ResetPasswordSchema } from "@/models/PasswordReset";
import { useResetPassword } from "@/services/PasswordServices";
import styles from "./LoginScreen.module.css";

export const ResetPasswordScreen = () => {
  const { mutate, error, isPending, isSuccess, data } = useResetPassword();

  const formData = useAppForm({
    defaultValues: { email: "", code: "", newPassword: "" },
    validators: { onChange: ResetPasswordSchema },
    onSubmit: async ({ value }) => mutate(value as ResetPasswordRequest),
  });

  const { AppForm, FormContainer, AppField } = formData;

  return (
    <CommonLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Reset Password</h1>

          {isSuccess && !error ? (
            <div style={{ textAlign: "center", color: "green" }}>
              <p>{data?.message || "Password reset successful!"}</p>
              <button className={styles.loginLink} onClick={() => window.location.href = "/login"}>
                Return to Login
              </button>
            </div>
          ) : (
            <>
              <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#666", margin: "1rem 0" }}>
                Enter the verification code from your email and choose a new password.
              </p>
              <AppForm>
                <FormContainer extraError={error}>
                  <AppField name="email" children={(field) => <field.TextField label="Email" />} />
                  <AppField name="code" children={(field) => <field.TextField label="Verification Code" />} />
                  <AppField name="newPassword" children={(field) => <field.PasswordField label="New Password" />} />
                  <button type="submit" disabled={isPending}>
                    {isPending ? "Resetting..." : "Reset Password"}
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
