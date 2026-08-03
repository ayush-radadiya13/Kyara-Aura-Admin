import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and use hyphens")
    .optional(),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  short_description: z.string().trim().optional(),
  category_id: z.string().trim().optional(),
  discount_percentage: z.coerce
    .number()
    .min(0, "Discount percentage must be 0 or greater")
    .max(100, "Discount percentage must be 100 or less"),
  weight_grams: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().min(0, "Weight must be 0 or greater").optional()
  ),
  brand: z.string().trim().optional(),
  base_material: z.string().trim().optional(),
  plating: z.string().trim().optional(),
  gemstone: z.string().trim().optional(),
  design: z.string().trim().optional(),
  occasion: z.string().trim().optional(),
  ideal_for: z.string().trim().optional(),
  package_contents: z.string().trim().optional(),
  is_active: z.boolean(),
  is_collection: z.boolean().optional(),
  review_count: z.coerce.number().min(0).optional(),
  images: z.array(z.any()).max(4, "Maximum 4 images allowed").optional(),
  video: z.string().trim().optional(),
  sizes: z.preprocess(
    (val) => (Array.isArray(val) ? val.filter((s) => String(s?.size_id || "").trim()) : []),
    z
      .array(
        z.object({
          size_id: z.string().trim().min(1, "Size is required"),
          quantity: z.coerce.number().int().min(0, "Quantity must be 0 or greater"),
          price: z.coerce.number().min(0, "Price must be 0 or greater"),
          discount_price: z.preprocess(
            (val) => (val === "" || val === null || val === undefined ? null : val),
            z.coerce.number().min(0, "Discount price must be 0 or greater").nullable().optional()
          ),
        })
      )
      .optional()
  ),
});
