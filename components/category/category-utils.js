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

function resolveParentId(item) {
  const value =
    item?.parent_id ??
    item?.parentId ??
    item?.parent_category_id ??
    item?.parent?.id ??
    item?.parent?._id ??
    null;

  if (value === undefined || value === null || value === "" || value === 0 || value === "0") {
    return null;
  }

  return String(value);
}

function resolveParentName(item) {
  return (
    item?.parent_name ??
    item?.parentName ??
    item?.parent_category_name ??
    item?.parent?.name ??
    item?.parent?.title ??
    ""
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
  const parentId = resolveParentId(item);

  return {
    id: resolveCategoryId(item),
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    description: item?.description ?? "",
    image_url: item?.image_url ?? item?.image ?? item?.thumbnail ?? "",
    is_active: normalizeCategoryStatus(item),
    parent_id: parentId,
    parent_name: resolveParentName(item),
    parent: item?.parent || null,
    sort_order: Number(item?.sort_order ?? item?.sortOrder ?? 0) || 0,
    is_subcategory: Boolean(parentId),
  };
}

export function getMainCategories(categories = [], excludeId) {
  const withoutSelf = categories.filter((category) => {
    if (excludeId && String(category.id) === String(excludeId)) return false;
    return Boolean(category.id);
  });

  const mains = withoutSelf.filter((category) => !category.parent_id);

  // When the list was already fetched as type=main, keep those rows even if
  // parent_id is unexpectedly present so the dropdown is never empty.
  return mains.length > 0 ? mains : withoutSelf;
}

export function getSubCategories(categories = []) {
  return categories.filter((category) => Boolean(category.parent_id));
}

export function filterCategoriesBySearch(categories = [], search = "") {
  const query = String(search || "").trim().toLowerCase();
  if (!query) return categories;

  return categories.filter((category) => {
    const haystack = [
      category.name,
      category.slug,
      category.description,
      category.parent_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function paginateCategories(categories = [], offset = 0, limit = 10) {
  const start = Math.max(0, Number(offset) || 0);
  const size = Math.max(1, Number(limit) || 10);
  return categories.slice(start, start + size);
}

export function sortCategoriesHierarchically(categories = []) {
  const byId = new Map(
    categories
      .filter((category) => category?.id !== undefined && category?.id !== null)
      .map((category) => [String(category.id), category])
  );

  const childrenByParent = new Map();

  categories.forEach((category) => {
    const parentKey =
      category.parent_id && byId.has(String(category.parent_id))
        ? String(category.parent_id)
        : "root";

    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }
    childrenByParent.get(parentKey).push(category);
  });

  const compareCategories = (a, b) => {
    const sortDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (sortDiff !== 0) return sortDiff;
    return String(a.name || "").localeCompare(String(b.name || ""));
  };

  childrenByParent.forEach((group) => group.sort(compareCategories));

  const ordered = [];

  const appendBranch = (parentKey, depth = 0) => {
    const children = childrenByParent.get(parentKey) || [];
    children.forEach((category) => {
      const parent = category.parent_id ? byId.get(String(category.parent_id)) : null;

      ordered.push({
        ...category,
        depth,
        parent_name: category.parent_name || parent?.name || "",
        is_subcategory: depth > 0 || Boolean(category.parent_id),
      });

      appendBranch(String(category.id), depth + 1);
    });
  };

  appendBranch("root", 0);

  // Include any orphaned subcategories whose parent is missing from the current page.
  categories.forEach((category) => {
    if (ordered.some((item) => String(item.id) === String(category.id))) return;

    ordered.push({
      ...category,
      depth: category.parent_id ? 1 : 0,
      is_subcategory: Boolean(category.parent_id),
    });
  });

  return ordered;
}

export async function buildCategoryPayload(
  payload,
  { editValue = 0, categoryId } = {}
) {
  const { image, parent_id, ...restPayload } = payload;
  const imageUrl =
    typeof image === "string"
      ? image
      : image?.url || image?.preview || "";

  const normalizedParentId =
    parent_id && parent_id !== "none" && parent_id !== "null"
      ? toNumberOrValue(parent_id)
      : null;

  return {
    ...restPayload,
    parent_id: normalizedParentId,
    sort_order: Number(restPayload.sort_order ?? 0) || 0,
    image_url: imageUrl,
    edit_value: toNumberOrValue(editValue),
    ...(categoryId ? { id: categoryId } : {}),
  };
}
