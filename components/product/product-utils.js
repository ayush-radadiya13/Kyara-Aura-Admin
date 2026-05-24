export function normalizeProduct(item) {
  return {
    id: item?.id ?? item?._id ?? null,
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    description: item?.description ?? "",
    short_description: item?.short_description ?? "",
    price: item?.price ?? "",
    sale_price: item?.sale_price ?? "",
    cost_price: item?.cost_price ?? "",
    category_id: item?.category_id ?? item?.category?._id ?? item?.category?.id ?? null,
    category_name: item?.category?.name ?? item?.category_name ?? "",
    is_active: Boolean(item?.is_active),
    stock_quantity: item?.stock_quantity ?? 0,
    track_stock: Boolean(item?.track_stock),
    images: item?.images ?? [],
    sizes: (item?.sizes ?? []).map((size) => ({
      size_text: size?.size_text ?? "",
      quantity: size?.quantity ?? "",
      price: size?.price ?? "",
    })),
  };
}

export function buildProductFormData(payload, { editValue = 0, productId } = {}) {
  const formData = new FormData();
  const skipKeys = new Set(["images", "sizes"]);

  Object.entries(payload).forEach(([key, value]) => {
    if (skipKeys.has(key) || value === undefined || value === null) return;
    formData.append(key, typeof value === "boolean" ? String(value) : value);
  });

  (payload.sizes ?? [])
    .filter((size) => size?.size_text?.trim())
    .forEach((size, index) => {
      formData.append(`sizes[${index}][size_text]`, size.size_text.trim());
      formData.append(`sizes[${index}][quantity]`, String(size.quantity ?? 0));
      formData.append(`sizes[${index}][price]`, String(size.price ?? 0));
    });

  (payload.images ?? []).forEach((image) => {
    if (image instanceof File) {
      formData.append("images", image);
    } else if (typeof image === "string") {
      formData.append("existing_images[]", image);
    }
  });

  formData.append("edit_value", String(editValue));
  if (productId) {
    formData.append("id", String(productId));
  }

  return formData;
}
