import { z } from "zod";

export const TagSchema = z.object({
  id: z.number(),
  tag: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;

export const TagFormSchema = z.object({
  tag: z.string().min(1, "Tag name is required"),
});

export type TagFormValues = z.infer<typeof TagFormSchema>;

export type TagCreateRequest = {
  tag: string;
};
