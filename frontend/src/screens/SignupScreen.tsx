import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { SignupRequestSchema } from "@/models/Login";
import { useSignup } from "@/services/UserServices";
import styles from "./SignupScreen.module.css";

export const SignupScreen = () => {
  const { mutate, error } = useSignup();

  const formData = useAppForm({
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      foto: "",
      edad: "",
      genero: "",
      domicilio: "",
      password: "",
    },
    validators: {
      onChange: (values) => {
        const result = SignupRequestSchema.safeParse(values);
        if (result.success) return {};

        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") errors[field] = issue.message;
        }
        return errors;
      },
    },
    onSubmit: async ({ value }) => {
      console.log("Enviando datos de registro:", value);
      mutate(value);
    },
  });

  const { AppForm, FormContainer, AppField } = formData;

  return (
    <CommonLayout>
      <div className={styles.signupContainer}>
        <div className={styles.signupCard}>
          <h1>Registro</h1>
          <AppForm>
            <FormContainer extraError={error}>
              <AppField name="nombre" children={(field) => <field.TextField label="Nombre" />} />
              <AppField name="apellido" children={(field) => <field.TextField label="Apellido" />} />
              <AppField name="email" children={(field) => <field.TextField label="Email" />} />
              <AppField name="password" children={(field) => <field.PasswordField label="Contraseña" />} />
              <AppField name="foto" children={(field) => <field.TextField label="Foto (URL)" />} />
              <AppField name="edad" children={(field) => <field.TextField label="Edad" />} />
              <AppField name="genero" children={(field) => <field.TextField label="Género" />} />
              <AppField name="domicilio" children={(field) => <field.TextField label="Domicilio" />} />
              <button type="submit">Registrarse</button>
            </FormContainer>
          </AppForm>
          <a href="/login" className={styles.loginLink}>
            ¿Ya tenés cuenta? Iniciá sesión
          </a>
        </div>
      </div>
    </CommonLayout>
  );
};
