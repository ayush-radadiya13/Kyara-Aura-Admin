export const BANNER_SLOT_COUNT = 4;
export const MAX_BANNER_VIDEO_SIZE = 30 * 1024 * 1024;

export const defaultBannerSettings = {
  image1: "",
  image2: "",
  image3: "",
  image4: "",
  video: "",
  video_url: "",
  banner_title: "",
  banner_description: "",
  video_title: "",
  video_description: "",
  sort_order: 1,
};

export function extractBannerSettings(response) {
  const data =
    response?.data?.data ||
    response?.data?.result ||
    response?.data?.banner ||
    response?.data ||
    response?.result ||
    response?.banner ||
    response ||
    {};

  if (Array.isArray(data)) {
    return data[0] || {};
  }

  return data;
}

export function normalizeBannerSettings(settings) {
  const video = settings?.video || settings?.video_url || "";

  return {
    image1: settings?.image1 || "",
    image2: settings?.image2 || "",
    image3: settings?.image3 || "",
    image4: settings?.image4 || "",
    video,
    video_url: settings?.video_url || video,
    banner_title: settings?.banner_title || "",
    banner_description: settings?.banner_description || "",
    video_title: settings?.video_title || "",
    video_description: settings?.video_description || "",
    sort_order: Number(settings?.sort_order) || 1,
    created_at: settings?.created_at || "",
    updated_at: settings?.updated_at || "",
  };
}

export function buildBannerFormState(settings) {
  const normalized = normalizeBannerSettings(settings);

  return {
    imageSlots: Array.from({ length: BANNER_SLOT_COUNT }, (_, index) => ({
      image: normalized[`image${index + 1}`] || "",
      sort_order: index + 1,
    })),
    banner_title: normalized.banner_title,
    banner_description: normalized.banner_description,
    video: normalized.video,
    video_title: normalized.video_title,
    video_description: normalized.video_description,
    sort_order: normalized.sort_order,
  };
}

export function buildBannerPayload(formState) {
  const video = formState.video || "";

  return {
    image1: formState.imageSlots[0]?.image?.trim() || "",
    image2: formState.imageSlots[1]?.image?.trim() || "",
    image3: formState.imageSlots[2]?.image?.trim() || "",
    image4: formState.imageSlots[3]?.image?.trim() || "",
    video,
    video_url: video,
    banner_title: formState.banner_title || "",
    banner_description: formState.banner_description || "",
    video_title: formState.video_title || "",
    video_description: formState.video_description || "",
    sort_order: formState.sort_order || 1,
  };
}

export function validateBannerFormState(formState) {
  const missingSlots = formState.imageSlots.reduce((missing, slot, index) => {
    if (!slot.image?.trim()) {
      missing.push(index + 1);
    }
    return missing;
  }, []);

  if (missingSlots.length === 0) {
    return { valid: true, message: "" };
  }

  const labels = missingSlots.map((slotNumber) => `Banner image ${slotNumber}`).join(", ");

  return {
    valid: false,
    message: `${labels} ${missingSlots.length === 1 ? "is" : "are"} required`,
  };
}

export function getBannerSaveErrorMessage(error) {
  const data = error?.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat().filter(Boolean);
    if (messages.length) {
      return messages.join(". ");
    }
  }

  return data?.message || error?.message || "Save failed";
}
