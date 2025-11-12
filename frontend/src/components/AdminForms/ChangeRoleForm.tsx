import { useState } from "react";
import { useAppForm } from "@/config/use-app-form";
import { useChangeUserRole } from "@/services/UserServices";
import { UserRoleFormSchema } from "@/models/User";
import styles from "./AdminForms.module.css";

type UserRoleFormValues = {
  email: string;
  role: string;
};

type ChangeRoleFormProps = {
  onClose: () => void;
};

const USER_ROLE_DEFAULTS: UserRoleFormValues = {
  email: "",
  role: "",
};

export const ChangeRoleForm = ({ onClose }: ChangeRoleFormProps) => {
  const changeUserRole = useChangeUserRole();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formData = useAppForm({
    defaultValues: USER_ROLE_DEFAULTS,
    validators: { onChange: UserRoleFormSchema },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null);
      await changeUserRole.mutateAsync(value);
      setSuccessMessage(
        `User "${value.email}" has been assigned the role "${value.role}".`
      );
    },
  });

  const submissionError = changeUserRole.error
    ? changeUserRole.error instanceof Error
      ? changeUserRole.error
      : new Error(String(changeUserRole.error))
    : null;

  return (
    <section className={styles.formSection} aria-labelledby="user-role-form-title">
      <h2 id="user-role-form-title" className={styles.formTitle}>
        Manage User Roles
      </h2>

      <formData.AppForm>
        <formData.FormContainer extraError={submissionError}>
          <formData.AppField
            name="email"
            children={(field) => <field.TextField label="Email" />}
          />

          <formData.AppField
            name="role"
            children={(field) => (
              <field.SelectField
                label="Select Role"
                placeholder="Select a role"
                options={[
                  { value: "ROLE_ADMIN", label: "Admin" },
                  { value: "ROLE_STAFF", label: "Staff" },
                  { value: "ROLE_USER", label: "User" },
                ]}
              />
            )}
          />

          <div className={styles.formActions}>
            <formData.Button label="Cancel" type="button" onClick={onClose} />
            <formData.Button label="Update Role" />
          </div>
        </formData.FormContainer>
      </formData.AppForm>

      {successMessage && (
        <p className={styles.formMessage}>{successMessage}</p>
      )}
    </section>
  );
};
