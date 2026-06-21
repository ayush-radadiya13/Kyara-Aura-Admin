export const defaultWebSettings = {
  email: "",
  address: "",
  footer_description: "",
  mobile_number: "",
  logo: "",
  logo_url: "",
  instagram_url: "",
  facebook_url: "",
  whatsapp_url: "",
  buy_two_get_one_free_enabled: false,
  first_order_discount_amount: 0,
  online_payment_discount_percent: 0,
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toLogoStoragePath(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    const match = trimmed.match(/\/uploads\/(.+)$/i);
    return match?.[1] || trimmed;
  }

  return trimmed.replace(/^uploads\//i, "");
}

export function resolveLogoPreviewUrl(logoPath, logoUrl) {
  const url = String(logoUrl || "").trim();
  if (url) return url;

  const path = String(logoPath || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = path.replace(/^\/+/, "").replace(/^uploads\//i, "");
  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE || "https://kayraaura.up.railway.app"
  ).replace(/\/$/, "");

  return `${apiBase}/uploads/${cleanPath}`;
}

export function extractWebSettings(response) {
  return (
    response?.data?.data ||
    response?.data?.result ||
    response?.data?.settings ||
    response?.data?.web_settings ||
    response?.data ||
    response?.result ||
    response?.settings ||
    response?.web_settings ||
    response ||
    {}
  );
}

export function normalizeWebSettings(settings) {
  const logoPath = toLogoStoragePath(
    settings?.logo || settings?.logo_url || settings?.logoUrl || ""
  );
  const logoUrl = resolveLogoPreviewUrl(
    logoPath,
    settings?.logo_url || settings?.logoUrl || ""
  );

  return {
    email: settings?.email || "",
    address: settings?.address || "",
    footer_description:
      settings?.footer_description || settings?.footerDescription || "",
    mobile_number:
      settings?.mobile_number ||
      settings?.mobileNumber ||
      settings?.phone ||
      settings?.mobile ||
      "",
    logo: logoPath,
    logo_url: logoUrl,
    instagram_url: settings?.instagram_url || settings?.instagramUrl || "",
    facebook_url: settings?.facebook_url || settings?.facebookUrl || "",
    whatsapp_url: settings?.whatsapp_url || settings?.whatsappUrl || "",
    youtube_url: settings?.youtube_url || settings?.youtubeUrl || "",
    linkedin_url: settings?.linkedin_url || settings?.linkedinUrl || "",
    buy_two_get_one_free_enabled: Boolean(
      settings?.buy_two_get_one_free_enabled ??
        settings?.buyTwoGetOneFreeEnabled ??
        false
    ),
    first_order_discount_amount: toNumber(
      settings?.first_order_discount_amount ?? settings?.firstOrderDiscountAmount,
      0
    ),
    online_payment_discount_percent: toNumber(
      settings?.online_payment_discount_percent ??
        settings?.onlinePaymentDiscountPercent,
      0
    ),
  };
}

export function buildWebSettingsPayload(settings) {
  const payload = {
    email: settings.email.trim(),
    address: settings.address.trim(),
    footer_description: settings.footer_description.trim(),
    mobile_number: settings.mobile_number.trim(),
    logo: toLogoStoragePath(settings.logo || settings.logo_url),
    instagram_url: settings.instagram_url.trim(),
    facebook_url: settings.facebook_url.trim(),
    whatsapp_url: settings.whatsapp_url.trim(),
    buy_two_get_one_free_enabled: Boolean(settings.buy_two_get_one_free_enabled),
    first_order_discount_amount: toNumber(settings.first_order_discount_amount, 0),
    online_payment_discount_percent: toNumber(
      settings.online_payment_discount_percent,
      0
    ),
  };

  if (settings.youtube_url?.trim()) {
    payload.youtube_url = settings.youtube_url.trim();
  }

  if (settings.linkedin_url?.trim()) {
    payload.linkedin_url = settings.linkedin_url.trim();
  }

  return payload;
}
