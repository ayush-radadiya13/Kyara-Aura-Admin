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
  };
}
