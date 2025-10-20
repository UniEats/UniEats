import { z } from "zod";

export const RequestResetSchema = z.object({
  email: z.string().min(1, "Email cannot be empty").email("Must be a valid email"),
});

export type RequestResetRequest = z.infer<typeof RequestResetSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().min(1, "Email cannot be empty").email("Must be a valid email"),
  code: z.string().min(6, "The code must be 6 characters long").max(6, "The code must be 6 characters long"),
  newPassword: z.string().min(6, "The password must be at least 6 characters longs"),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;