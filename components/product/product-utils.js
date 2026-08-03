function normalizeProductImage(image) {
  if (typeof image === "string" && image.trim()) {
    return image;
  }

  const value =
    image?.url ||
    image?.preview ||
    image?.image_url ||
    image?.path ||
    image?.file ||
    image?.location ||
    image?.secure_url ||
    image?.image ||
    "";

  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeProductImages(item) {
  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  };

  const images = [
    ...toArray(item?.image),
    ...toArray(item?.images),
    ...toArray(item?.primary_image),
    item?.image_url,
    item?.primary_image_url,
  ];

  return images
    .map(normalizeProductImage)
    .filter(Boolean)
    .filter((url) => !looksLikeVideoUrl(url));
}

function isNumericString(value) {
  return typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value));
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["1", "true", "active"].includes(value.toLowerCase());
  }

  return false;
}

function resolveProductCategoryId(item) {
  const category = item?.category;
  const categoryId =
    item?.category_id ??
    item?.categoryId ??
    item?.categoryID ??
    category?.category_id ??
    category?.categoryId ??
    category?._id ??
    category?.id;

  if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
    return categoryId;
  }

  if (typeof category === "number" || isNumericString(category)) {
    return category;
  }

  return null;
}

function resolveProductCategoryName(item) {
  const category = item?.category;
  const categoryName =
    item?.category_name ??
    item?.categoryName ??
    category?.name ??
    category?.title ??
    category?.label;

  if (categoryName) {
    return categoryName;
  }

  return typeof category === "string" && !isNumericString(category) ? category : "";
}

const VIDEO_EXTENSION_REGEX = /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?.*)?$/i;

function looksLikeVideoUrl(url) {
  return typeof url === "string" && VIDEO_EXTENSION_REGEX.test(url.trim());
}

function getObjectUrl(value) {
  const candidate =
    value.url ||
    value.video_url ||
    value.video ||
    value.image_url ||
    value.image_path ||
    value.preview ||
    value.path ||
    value.file ||
    value.location ||
    value.secure_url ||
    value.src ||
    value.image ||
    "";
  return typeof candidate === "string" ? candidate.trim() : "";
}

function isVideoTyped(value) {
  const type = String(value?.type || value?.mime_type || value?.media_type || "").toLowerCase();
  return type.startsWith("video") || type === "mp4";
}

function resolveVideoUrl(value, { requireVideoLike = false } = {}) {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return !requireVideoLike || looksLikeVideoUrl(trimmed) ? trimmed : "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = resolveVideoUrl(item, { requireVideoLike: true });
      if (url) return url;
    }
    return "";
  }

  if (typeof value === "object") {
    const url = getObjectUrl(value);
    if (!url) return "";
    if (requireVideoLike && !isVideoTyped(value) && !looksLikeVideoUrl(url)) {
      return "";
    }
    return url;
  }

  return "";
}

function resolveProductVideo(item) {
  const candidates = [
    item?.video,
    item?.video_url,
    item?.videoUrl,
    item?.product_video,
    item?.productVideo,
    item?.video_link,
    item?.videoLink,
    item?.videos,
    item?.media,
  ];

  for (const candidate of candidates) {
    const url = resolveVideoUrl(candidate);
    if (url) return url;
  }

  const mixedMedia = [
    ...(Array.isArray(item?.image) ? item.image : item?.image ? [item.image] : []),
    ...(Array.isArray(item?.images) ? item.images : item?.images ? [item.images] : []),
  ];

  for (const media of mixedMedia) {
    const url = resolveVideoUrl(media, { requireVideoLike: true });
    if (url) return url;
  }

  return "";
}

function resolveProductSizeId(size) {
  const sizeId =
    size?.size_id ??
    size?.sizeId ??
    size?.size?.id ??
    size?.size?._id ??
    size?.id;

  return sizeId !== undefined && sizeId !== null && sizeId !== "" ? sizeId : "";
}

export function normalizeProduct(item) {
  return {
    id: item?.id ?? item?._id ?? item?.product_id ?? item?.productId ?? item?.productID ?? null,
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    description: item?.description ?? "",
    short_description: item?.short_description ?? "",
    discount_percentage: item?.discount_percentage ?? "",
    weight_grams: item?.weight_grams ?? "",
    category_id: resolveProductCategoryId(item),
    category_name: resolveProductCategoryName(item),
    brand: item?.brand ?? "",
    base_material: item?.base_material ?? item?.baseMaterial ?? "",
    plating: item?.plating ?? "",
    gemstone: item?.gemstone ?? "",
    design: item?.design ?? "",
    occasion: item?.occasion ?? "",
    ideal_for: item?.ideal_for ?? item?.idealFor ?? "",
    package_contents: item?.package_contents ?? item?.packageContents ?? "",
    is_active: normalizeBoolean(item?.is_active ?? item?.status),
    is_collection: normalizeBoolean(item?.is_collection ?? item?.add_collection),
    review_count: item?.review_count ?? item?.reviews_count ?? 0,
    images: normalizeProductImages(item),
    video: resolveProductVideo(item),
    sizes: (item?.sizes ?? []).map((size) => ({
      size_id: resolveProductSizeId(size),
      size_text: size?.size_text ?? size?.size?.name ?? size?.name ?? "",
      quantity: size?.quantity ?? "",
      price: size?.price ?? "",
      discount_price: size?.discount_price ?? size?.discountPrice ?? null,
    })),
  };
}

function resolveProductImages(images) {
  return (images ?? []).map((image) => {
    if (typeof image === "string") {
      return {
        value: image,
        isExisting: true,
      };
    }

    const value =
      image?.url ||
      image?.preview ||
      image?.image_url ||
      image?.path ||
      image?.file ||
      image?.location ||
      image?.secure_url ||
      image?.image ||
      "";
    if (typeof value === "string" && value.trim()) {
      return {
        value,
        isExisting: Boolean(image?.isExisting),
      };
    }

    return null;
  });
}

function toNumberOrValue(value) {
  if (value === "" || value === undefined || value === null) return value;

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

export function buildProductPayload(
  payload,
  { editValue = 0 } = {}
) {
  const images = resolveProductImages(payload.images)
    .filter(Boolean)
    .map((image) => image.value);

  return {
    edit_value: toNumberOrValue(editValue),
    name: payload.name ?? "",
    slug: payload.slug ?? "",
    description: payload.description ?? "",
    short_description: payload.short_description ?? "",
    category_id: toNumberOrValue(payload.category_id),
    discount_percentage: 0,
    weight_grams:
      payload.weight_grams === "" || payload.weight_grams === undefined
        ? null
        : toNumberOrValue(payload.weight_grams),
    is_active: Boolean(payload.is_active),
    is_collection: Boolean(payload.is_collection ?? payload.add_collection),
    review_count: toNumberOrValue(payload.review_count ?? 0),
    brand: payload.brand ?? "",
    base_material: payload.base_material ?? "",
    plating: payload.plating ?? "",
    gemstone: payload.gemstone ?? "",
    design: payload.design ?? "",
    occasion: payload.occasion ?? "",
    ideal_for: payload.ideal_for ?? "",
    package_contents: payload.package_contents ?? "",
    sizes: (payload.sizes ?? [])
      .filter((size) => String(size?.size_id || "").trim())
      .map((size) => ({
        size_id: toNumberOrValue(size.size_id),
        quantity: toNumberOrValue(size.quantity ?? 0),
        price: toNumberOrValue(size.price ?? 0),
        discount_price:
          size.discount_price === "" || size.discount_price === undefined || size.discount_price === null
            ? null
            : toNumberOrValue(size.discount_price),
      })),
    image: images,
    video: payload.video ?? "",
  };
}
