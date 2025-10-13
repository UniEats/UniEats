import { z } from "zod";

export const UserCountSchema = z.object({
  total: z.number(),
});

export type UserCount = z.infer<typeof UserCountSchema>;
