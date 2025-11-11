import { useAppForm } from "@/config/use-app-form";
import { SignupRequest, SignupRequestSchema } from "@/models/Login";

type Props = {
    onSubmit: (value: SignupRequest) => void;
    submitError: Error | null;
};
const SIGN_UP_DEFAULT_VALUES: SignupRequest = {
    nombre: "",
    apellido: "",
    email: "",
    foto: null,
    edad: "",
    genero: "",
    domicilio: "",
    password: "",
}
export function Signup({ onSubmit, submitError }: Props) {
    const formData = useAppForm({
        defaultValues: SIGN_UP_DEFAULT_VALUES,
        validators: {
            onChange: SignupRequestSchema,
        },
        onSubmit: async ({ value }) => {
            onSubmit(value as SignupRequest);
        },
    });


    return (
        <formData.AppForm>
            <formData.FormContainer extraError={submitError}>
                <formData.AppField name="nombre" children={(field) => <field.TextField label="Name" />} />
                <formData.AppField name="apellido" children={(field) => <field.TextField label="Surname" />} />
                <formData.AppField name="email" children={(field) => <field.TextField label="Email" />} />
                <formData.AppField name="password" children={(field) => <field.PasswordField label="Password" />} />
                <formData.AppField name="foto" children={(field) => <field.FileField label="Photo" />} />
                <formData.AppField name="edad" children={(field) => <field.TextField label="Age" />} />
                <formData.AppField name="genero" children={(field) => <field.TextField label="Genre" />} />
                <formData.AppField name="domicilio" children={(field) => <field.TextField label="Residence" />} />

                <button type="submit">Sign up</button>
            </formData.FormContainer>
        </formData.AppForm>
    );
}