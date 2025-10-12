import { z } from "zod";

export const MenuSectionSchema = z.object({
  id: z.number(),
  label: z.string(),
  description: z.string(),
});

export const MenuSectionListSchema = z.array(MenuSectionSchema);

export const MenuSectionFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  description: z.string().min(1, "Description is required"),
});

export type MenuSection = z.infer<typeof MenuSectionSchema>;
export type MenuSectionList = z.infer<typeof MenuSectionListSchema>;
export type MenuSectionFormValues = z.infer<typeof MenuSectionFormSchema>;

export type MenuSectionCreateRequest = {
  label: string;
  description: string;
};