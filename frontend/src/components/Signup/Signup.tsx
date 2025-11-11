import { useAppForm } from "@/config/use-app-form";
import { SignupRequest, SignupRequestSchema } from "@/models/Login";

type Props = {
    onSubmit: (value: SignupRequest) => void;
    submitError: Error | null;
    isPending: boolean;
};
const SIGN_UP_DEFAULT_VALUES: SignupRequest = {
    name: "",
    last_name: "",
    email: "",
    photo: null,
    age: "",
    gender: "",
    address: "",
    password: "",
}
export function Signup({ onSubmit, submitError, isPending }: Props) {
    const formData = useAppForm({
        defaultValues: SIGN_UP_DEFAULT_VALUES,
        validators: {
            onChange: SignupRequestSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value as SignupRequest);
        },
    });

    const { AppForm, FormContainer, AppField } = formData;

    return (
        <AppForm>
            <FormContainer extraError={submitError}>
                <AppField name="name" children={(field) => <field.TextField label="Name" />} />
                <AppField name="last_name" children={(field) => <field.TextField label="Last Name" />} />
                <AppField name="email" children={(field) => <field.TextField label="Email" />} />
                <AppField name="password" children={(field) => <field.PasswordField label="Password" />} />
                <AppField name="photo" children={(field) => <field.FileField label="Photo" />} />
                <AppField name="age" children={(field) => <field.TextField label="Age" />} />
                <AppField name="gender" children={(field) => <field.TextField label="Gender" />} />
                <AppField name="address" children={(field) => <field.TextField label="Address" />} />
                
                <formData.Button label="Sign Up" isPending={isPending} />
            </FormContainer>
        </AppForm>
    );
}
