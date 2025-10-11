import { z } from "zod";

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  tags: z.array(z.string()),
  menuSections: z.array(z.string()).optional(),
  image: z.string().optional(),
});

export const ProductListSchema = z.array(ProductSchema);

export type Product = z.infer<typeof ProductSchema>;
export type ProductList = z.infer<typeof ProductListSchema>;

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, "Price must be a non-negative number")
    .refine(
      (value) => {
        const parts = value.split(".");
        return parts.length <= 2 && (parts.length === 1 || parts[1].length <= 2);
      },
      "Price cannot have more than two decimal places"
    ),
  ingredientIds: z.array(z.string()).min(1, "Select at least one ingredient"),
  tagIds: z.array(z.string()),
  menuSectionIds: z.array(z.string()).min(1, "Select at least one menu section"),
  image: z
    .instanceof(File)
    .or(z.null())
    .refine((file) => file !== null, "Image is required"),
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;

export const ProductUpdateFormSchema = z
  .object({
    productId: z.string().min(1, "Select a product"),
    name: z.string(),
    description: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.name.trim().length === 0 && data.description.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Provide a new name or description",
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: "Provide a new name or description",
      });
    }
  });

export type ProductUpdateFormValues = z.infer<typeof ProductUpdateFormSchema>;

export type ProductCreateRequest = {
  name: string;
  description: string;
  price: number;
  ingredientIds: number[];
  tagIds: number[];
  menuSectionIds: number[];
  image: File;
};

export type ProductUpdateRequest = {
  name?: string;
  description?: string;
};
