export function normalizeCategory(item) {
  return {
    id: item?.id ?? item?._id ?? null,
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    description: item?.description ?? "",
    sort_order: item?.sort_order ?? 0,
    parent_id: item?.parent_id ?? item?.parent?._id ?? item?.parent?.id ?? null,
    parent_name: item?.parent?.name ?? item?.parent_name ?? "",
    is_active: Boolean(item?.is_active),
  };
}
