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
                <formData.AppField name="nombre" children={(field) => <field.TextField label="Nombre" />} />
                <formData.AppField name="apellido" children={(field) => <field.TextField label="Apellido" />} />
                <formData.AppField name="email" children={(field) => <field.TextField label="Email" />} />
                <formData.AppField name="password" children={(field) => <field.PasswordField label="Contraseña" />} />
                <formData.AppField
                    name="foto"
                    children={(field) => (
                        <div>
                            <label htmlFor="user-foto">Foto de perfil</label>
                            <input
                                id="user-foto"
                                type="file"
                                accept="image/*"
                                onBlur={field.handleBlur}
                                onChange={(event) => {
                                    const file = event.currentTarget.files ? event.currentTarget.files[0] ?? null : null;
                                    field.handleChange(file);
                                }}
                            />
                        </div>
                    )}
                />

                <formData.AppField name="edad" children={(field) => <field.TextField label="Edad" />} />
                <formData.AppField name="genero" children={(field) => <field.TextField label="Género" />} />
                <formData.AppField name="domicilio" children={(field) => <field.TextField label="Domicilio" />} />

                <button type="submit">Registrarse</button>
            </formData.FormContainer>
        </formData.AppForm>
    );
}