import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  parent_id: z.union([z.string().trim().min(1), z.null()]).optional(),
  sort_order: z.coerce.number().int().min(0, "Sort order must be 0 or greater"),
  is_active: z.boolean(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and use hyphens"),
});
