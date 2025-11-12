import { z } from "zod";

export const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  stock: z.number(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;

export const IngredientCreateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  stock: z
    .string()
    .min(1, "Stock is required")
    .regex(/^\d+$/, "Stock must be a non-negative integer"),
});

export type IngredientCreateFormValues = z.infer<typeof IngredientCreateFormSchema>;

export type IngredientCreateRequest = {
  name: string;
  description: string;
  stock: number;
};

export const IngredientUpdateFormSchema = z.object({
  ingredientId: z.string().min(1, "Select an ingredient"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export type IngredientUpdateFormValues = z.infer<typeof IngredientUpdateFormSchema>;

export const IngredientIncreaseStockSchema = z.object({
  ingredientId: z.string().min(1, "Select an ingredient"),
  name: z.string(),
  description: z.string(),
  stockAmount: z.number().min(1, "Stock amount must be at least 1."),
});

export type IngredientIncreaseStockFormValues = z.infer<typeof IngredientIncreaseStockSchema>;
