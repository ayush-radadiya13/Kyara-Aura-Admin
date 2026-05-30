export function normalizeCategory(item) {
  return {
    id: item?.id ?? item?._id ?? null,
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    description: item?.description ?? "",
    image_url: item?.image_url ?? item?.image ?? item?.thumbnail ?? "",
    is_active: Boolean(item?.is_active),
  };
}

export async function buildCategoryPayload(
  payload,
  { editValue = 0, categoryId } = {}
) {
  const { image, ...restPayload } = payload;
  const imageUrl =
    typeof image === "string"
      ? image
      : image?.url || image?.preview || "";

  return {
    ...restPayload,
    image_url: imageUrl,
    edit_value: editValue,
    ...(categoryId ? { id: categoryId } : {}),
  };
}
