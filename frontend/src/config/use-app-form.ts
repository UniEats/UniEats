import { createFormHook } from "@tanstack/react-form";

import { FormContainer } from "@/components/form-components/FormContainer/FormContainer";
import { PasswordField, TextField, FileField, CheckboxField, ItemQuantityField } from "@/components/form-components/InputFields/InputFields";
import { Button } from "@/components/form-components/SubmitButton/SubmitButton";
import { fieldContext, formContext } from "@/config/form-context";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
    FileField,
    CheckboxField,
    ItemQuantityField,
  },
  formComponents: {
    FormContainer,
    Button,
  },
});
