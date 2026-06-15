function toNumberOrValue(value) {
  if (value === "" || value === undefined || value === null) return value;

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

function resolveCategoryId(item) {
  return (
    item?.id ??
    item?._id ??
    item?.category_id ??
    item?.categoryId ??
    item?.categoryID ??
    item?.edit_value ??
    null
  );
}

function normalizeCategoryStatus(item) {
  const value = item?.is_active ?? item?.status;

  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["1", "true", "active"].includes(value.toLowerCase());
  }

  return false;
}

export function normalizeCategory(item) {
  return {
    id: resolveCategoryId(item),
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    description: item?.description ?? "",
    image_url: item?.image_url ?? item?.image ?? item?.thumbnail ?? "",
    is_active: normalizeCategoryStatus(item),
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
    edit_value: toNumberOrValue(editValue),
    ...(categoryId ? { id: categoryId } : {}),
  };
}
