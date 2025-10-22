// frontend/src/screens/VerifyScreen.tsx
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { VerifyRequest, VerifyRequestSchema } from "@/models/Login";
import { useVerify } from "@/services/UserServices";
import styles from "./LoginScreen.module.css";

export const VerifyScreen = () => {
  const { mutate, error, isPending, isSuccess, data } = useVerify();

  const formData = useAppForm({
    defaultValues: {
      email: "",
      code: "",
    },
    validators: {
      onChange: VerifyRequestSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value as VerifyRequest);
    },
  });

  return (
    <CommonLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Verify Your Email</h1>
          {isSuccess && !error ? (
            <div style={{ textAlign: "center", color: "green" }}>
              <p>{data?.message || "Verification successful!"}</p>
              <a href="/login" className={styles.loginLink} style={{ marginTop: "1rem" }}>
                Click here to Login
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
                Check your email for the 6-digit verification code.
              </p>
              <formData.AppForm>
                <formData.FormContainer extraError={error}>
                  <formData.AppField name="email" children={(field) => <field.TextField label="Email" />} />
                  <formData.AppField name="code" children={(field) => <field.TextField label="Verification Code" />} />
                  <button type="submit" disabled={isPending}>
                    {isPending ? "Verifying..." : "Verify"}
                  </button>
                </formData.FormContainer>
              </formData.AppForm>
            </>
          )}
        </div>
      </div>
    </CommonLayout>
  );
};
