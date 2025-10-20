import React from "react";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import styles from "./LoginScreen.module.css";

type ForgotValues = {
  email: string;
};

export const ForgotPasswordScreen: React.FC = () => {
  const formData = useAppForm({
    defaultValues: { email: "" },
    validators: {},
    onSubmit: async ({ value }: { value: ForgotValues }) => {
      // Aca llamada al servicio para iniciar la recuperación, por ahora sólo mostramos en consola
      console.log("Forgot password submit", value.email);
      // TODO: mostrar feedback al usuario, redirección
    },
  });

  return (
    <CommonLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Recover password</h1>
          <formData.AppForm>
            <formData.FormContainer extraError={null}>
              <formData.AppField
                name="email"
                children={(field: any) => <field.TextField label="Email" />}
              />
              <button type="submit">Send recovery email</button>
            </formData.FormContainer>
          </formData.AppForm>
        </div>
      </div>
    </CommonLayout>
  );
};

export default ForgotPasswordScreen;
