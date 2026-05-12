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
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a valid number greater than 0",
  }),
  sale_price: z.string().refine((val) => !val || !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Sale price must be a valid number greater than 0",
  }).optional(),
  cost_price: z.string().refine((val) => !val || !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Cost price must be a valid number greater than or equal to 0",
  }).optional(),
  category_id: z.string().trim().optional(),
  is_active: z.boolean(),
  stock_quantity: z.coerce.number().int().min(0, "Stock quantity must be 0 or greater"),
  track_stock: z.boolean(),
  images: z.array(z.any()).optional(),
}).refine((data) => {
  if (data.sale_price && data.price) {
    return parseFloat(data.sale_price) < parseFloat(data.price);
  }
  return true;
}, {
  message: "Sale price must be less than regular price",
  path: ["sale_price"],
});
