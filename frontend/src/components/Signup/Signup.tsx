import { useAppForm } from "@/config/use-app-form";
import { SignupRequest, SignupRequestSchema } from "@/models/Login";

type Props = {
    onSubmit: (value: SignupRequest) => void;
    submitError: Error | null;
};

export function Signup({ onSubmit, submitError }: Props) {
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
            // Keep your existing validation logic
            onChange: SignupRequestSchema,
        },
        onSubmit: async ({ value }) => {
            onSubmit(value as SignupRequest);
        },
    });

    const { AppForm, FormContainer, AppField } = formData;

    return (
        <AppForm>
            <FormContainer extraError={submitError}>
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
    );
}