import { z } from "zod";

export const MenuItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  tags: z.array(z.string()).optional(),
  // image: z.string().url().optional(),
});

export const MenuSectionSchema = z.object({
  id: z.number(),
  label: z.string(),
  description: z.string(),
  products: z.array(MenuItemSchema),
});

// El backend devuelve un ARRAY de secciones directamente, no un objeto con "sections"
export const MenuSchema = z.array(MenuSectionSchema);

export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuSection = z.infer<typeof MenuSectionSchema>;
export type Menu = z.infer<typeof MenuSchema>;

// Para crear, sigue tu versión (no cambia)
export const MenuCreateRequestItemSchema = z.object({
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().min(1, "Description must not be empty"),
  price: z.string().min(1, "Price must not be empty"),
  tags: z.array(z.string()).optional(),
  // image: z.string().url().optional(),
});

export const MenuCreateRequestSectionSchema = z.object({
  name: z.string().min(1, "Name must not be empty"),
  label: z.string().min(1, "Label must not be empty"),
  description: z.string().min(1, "Subtitle must not be empty"),
  products: z.array(MenuCreateRequestItemSchema).min(1, "At least one item is required"),
});

export const MenuCreateRequestSchema = z.object({
  sections: z.array(MenuCreateRequestSectionSchema).min(1, "At least one section is required"),
});

export type MenuCreateRequest = z.infer<typeof MenuCreateRequestSchema>;
export type MenuCreateRequestSection = z.infer<typeof MenuCreateRequestSectionSchema>;
export type MenuCreateRequestItem = z.infer<typeof MenuCreateRequestItemSchema>;
