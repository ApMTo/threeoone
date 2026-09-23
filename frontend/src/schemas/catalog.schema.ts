import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

const sizeRowSchema = z.object({
  label: z.string().trim().min(1, "Size is required").max(20),
  quantity: z.coerce.number().int().min(0, "Min 0"),
});

const colorRowSchema = z.object({
  hex: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Pick a valid color"),
  name: z.string().trim().max(60).optional().or(z.literal("")),
  sizes: z.array(sizeRowSchema).min(1, "Add at least one size for this color"),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\//i.test(value), {
      message: "Enter a valid URL",
    }),
  categoryId: z.string().min(1, "Choose a subcategory"),
  colors: z.array(colorRowSchema).min(1, "Add at least one color"),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
