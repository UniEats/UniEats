import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { SignupRequestSchema } from "@/models/Login";
import { useSignup } from "@/services/UserServices";
import styles from "./SignupScreen.module.css";


export const SignupScreen = () => {
  const { mutate, error } = useSignup();

  const formData = useAppForm({
    defaultValues: {
      username: "",
      password: "",
      role: "ROLE_USER",
    },
    validators: {
      onChange: SignupRequestSchema,
    },
    onSubmit: async ({ value }) => mutate(value),
  });

  return (
    <CommonLayout>
      <div className={styles.signupContainer}>
        <div className={styles.signupCard}>
          <h1>Sign Up</h1>
          <formData.AppForm>
            <formData.FormContainer extraError={error}>
              <formData.AppField name="username" children={(field) => <field.TextField label="Username" />} />
              <formData.AppField name="password" children={(field) => <field.PasswordField label="Password" />} />
              <button type="submit">Sign Up</button>
            </formData.FormContainer>
          </formData.AppForm>
          <a href="/login" className={styles.loginLink}>Already have an account? Log in</a>
        </div>
      </div>
    </CommonLayout>
  );
};
