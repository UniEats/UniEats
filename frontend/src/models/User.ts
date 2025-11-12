import { z } from "zod";

export const UserCountSchema = z.object({
  total: z.number(),
});

export type UserCount = z.infer<typeof UserCountSchema>;

export const UserRoleFormSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required"),
  role: z.string().min(1, "You must select a role"),
});

export type UserRoleForm = z.infer<typeof UserRoleFormSchema>;
