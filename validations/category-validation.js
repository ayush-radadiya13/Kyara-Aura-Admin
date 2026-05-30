import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  is_active: z.boolean(),
  image: z.any().optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and use hyphens"),
});
