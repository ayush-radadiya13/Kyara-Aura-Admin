export const BANNER_SLOT_COUNT = 4;

export function getBannerId(banner) {
  return banner?.id ?? banner?._id ?? banner?.banner_id ?? banner?.edit_value ?? null;
}

export function getBannerImage(banner) {
  return (
    banner?.image ||
    banner?.image_url ||
    banner?.url ||
    banner?.path ||
    banner?.file ||
    ""
  );
}

export function normalizeBanner(banner, fallbackSortOrder = 1) {
  const sortOrder = Number(banner?.sort_order ?? banner?.sortOrder ?? fallbackSortOrder);

  return {
    ...banner,
    id: getBannerId(banner),
    image: getBannerImage(banner),
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
      sort_order: sortOrder,
    };
  });
}
