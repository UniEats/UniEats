import { z } from "zod";

export const ProductsMapSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    quantity: z.number(),
  })
);
export const TagsMapSchema = z.record(z.string(), z.string());
export const MenuSectionsMapSchema = z.record(z.string(), z.string());

export const ComboSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  tags: TagsMapSchema,
  products: ProductsMapSchema,
  menuSections: MenuSectionsMapSchema,
  image: z.string().optional(),
});

export const ComboListSchema = z.array(ComboSchema);

export type TagsMap = Record<number, string>;
export type MenuSectionsMap = Record<number, string>;
export type Combo = z.infer<typeof ComboSchema>;

export type ComboList = z.infer<typeof ComboListSchema>;

export const ComboFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z
    .string()
    .min(1, { message: "Price is required" })
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, "Price must be a non-negative number")
    .refine(
      (value) => {
        const parts = value.split(".");
        return parts.length <= 2 && (parts.length === 1 || parts[1].length <= 2);
      },
      "Price cannot have more than two decimal places"
    ),
  productIds: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
    })
  ).min(1, "Select at least one product"),
  tagIds: z.array(z.string()),
  menuSectionIds: z.array(z.string()),
  image: z
    .instanceof(File)
    .or(z.null())
    .refine((file) => file !== null, "Image is required"),
});

export type ComboFormValues = z.infer<typeof ComboFormSchema>;

export const ComboUpdateFormSchema = z
  .object({
    comboId: z.number().min(1, { message: "Select a combo" }),
    name: z.string(),
    description: z.string(),
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
    productIds: z.array(
      z.object({
        id: z.string(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    ).min(1, "Select at least one product"),
    tagIds: z.array(z.string()),
    menuSectionIds: z.array(z.string()),

    image: z.instanceof(File).or(z.null()),
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

export type ComboUpdateFormValues = z.infer<typeof ComboUpdateFormSchema>;

export type ComboCreateRequest = {
  name: string;
  description: string;
  price: number;
  productIds: { productId: number; quantity: number }[];
  tagIds: number[];
  menuSectionIds: number[];
  image: File;
};

export type ComboUpdateRequest = {
  name?: string;
  description?: string;
  price?: number;
  productIds?: { productId: number; quantity: number }[];
  tagIds?: number[];
  menuSectionIds?: number[];
  image?: File;
};