import { z } from "zod";

export const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  stock: z.number(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;

export const IngredientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  stock: z
    .string()
    .min(1, "Stock is required")
    .regex(/^\d+$/, "Stock must be a non-negative integer"),
});

export type IngredientFormValues = z.infer<typeof IngredientFormSchema>;

export type IngredientCreateRequest = {
  name: string;
  description: string;
  stock: number;
};
