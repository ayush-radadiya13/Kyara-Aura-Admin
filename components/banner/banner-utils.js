export const BANNER_SLOT_COUNT = 4;
export const MAX_BANNER_VIDEO_SIZE = 30 * 1024 * 1024;

export function getBannerId(banner) {
  return banner?.id ?? banner?._id ?? banner?.banner_id ?? banner?.edit_value ?? null;
}

export function getBannerImage(banner) {
  const image =
    banner?.image ||
    banner?.image_url ||
    banner?.url ||
    banner?.path ||
    banner?.file ||
    "";

  if (Array.isArray(image)) {
    return image.find((value) => typeof value === "string" && value.trim()) || "";
  }

  return typeof image === "string" ? image : "";
}

export function getBannerVideo(banner) {
  return banner?.video || banner?.video_url || "";
}

export function normalizeBanner(banner, fallbackSortOrder = 1) {
  const sortOrder = Number(banner?.sort_order ?? banner?.sortOrder ?? fallbackSortOrder);

  return {
    ...banner,
    id: getBannerId(banner),
    image: getBannerImage(banner),
    video: getBannerVideo(banner),
    banner_title: banner?.banner_title || "",
    banner_description: banner?.banner_description || "",
    video_title: banner?.video_title || "",
    video_description: banner?.video_description || "",
    sort_order: Number.isFinite(sortOrder) ? sortOrder : fallbackSortOrder,
  };
}

export function extractBannerList(response) {
  const list =
    response?.data?.data ||
    response?.data?.results ||
    response?.data?.banners ||
    response?.data ||
    response?.results ||
    response?.banners ||
    response ||
    [];

  return Array.isArray(list) ? list : [];
}

export function buildBannerSlots(banners) {
  const normalizedBanners = banners.map((banner, index) =>
    normalizeBanner(banner, index + 1)
  );

  return Array.from({ length: BANNER_SLOT_COUNT }, (_, index) => {
    const sortOrder = index + 1;
    const banner =
      normalizedBanners.find((item) => item.sort_order === sortOrder) ||
      normalizedBanners[index];

    return {
      id: banner?.id ?? null,
      image: banner?.image ?? "",
      video: banner?.video ?? "",
      banner_title: banner?.banner_title ?? "",
      banner_description: banner?.banner_description ?? "",
      video_title: banner?.video_title ?? "",
      video_description: banner?.video_description ?? "",
      sort_order: sortOrder,
    };
  });
}

function getSharedField(slots, field) {
  return slots.find((slot) => slot?.[field])?.[field] || slots[0]?.[field] || "";
}

export function buildBannerFormState(banners) {
  const slots = buildBannerSlots(banners);
  const videoSlot = slots.find((slot) => slot.video) || slots[0];

  return {
    imageSlots: slots.map((slot) => ({
      id: slot.id,
      image: slot.image,
      sort_order: slot.sort_order,
    })),
    banner_title: getSharedField(slots, "banner_title"),
    banner_description: getSharedField(slots, "banner_description"),
    video: videoSlot?.video || "",
    video_title: getSharedField(slots, "video_title"),
    video_description: getSharedField(slots, "video_description"),
  };
}

export function buildBannerPayload(slot, { includeVideo = false } = {}) {
  return {
    edit_value: slot?.id || 0,
    image: slot?.image ? [slot.image] : [],
    video: includeVideo ? slot?.video || "" : "",
    banner_title: slot?.banner_title || "",
    banner_description: slot?.banner_description || "",
    video_title: includeVideo ? slot?.video_title || "" : "",
    video_description: includeVideo ? slot?.video_description || "" : "",
    sort_order: slot?.sort_order || 1,
  };
}
