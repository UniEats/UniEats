import { z } from "zod";

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  tags: z.array(z.string()),
  image: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, "Price must be a non-negative number"),
  ingredientIds: z.array(z.string()).min(1, "Select at least one ingredient"),
  tagIds: z.array(z.string()),
  image: z
    .instanceof(File)
    .or(z.null())
    .refine((file) => file !== null, "Image is required"),
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;

export type ProductCreateRequest = {
  name: string;
  description: string;
  price: number;
  ingredientIds: number[];
  tagIds: number[];
  image: File;
};
