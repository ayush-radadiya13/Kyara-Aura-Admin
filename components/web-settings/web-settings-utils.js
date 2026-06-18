export const defaultWebSettings = {
  email: "",
  address: "",
  mobile_number: "",
  logo: "",
  instagram_url: "",
  facebook_url: "",
  whatsapp_url: "",
};

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
  return {
    email: settings?.email || "",
    address: settings?.address || "",
    mobile_number:
      settings?.mobile_number ||
      settings?.mobileNumber ||
      settings?.phone ||
      settings?.mobile ||
      "",
    logo: settings?.logo || settings?.logo_url || settings?.logoUrl || "",
    instagram_url: settings?.instagram_url || settings?.instagramUrl || "",
    facebook_url: settings?.facebook_url || settings?.facebookUrl || "",
    whatsapp_url: settings?.whatsapp_url || settings?.whatsappUrl || "",
    youtube_url: settings?.youtube_url || settings?.youtubeUrl || "",
    linkedin_url: settings?.linkedin_url || settings?.linkedinUrl || "",
  };
}

export function buildWebSettingsPayload(settings) {
  const payload = {
    email: settings.email.trim(),
    address: settings.address.trim(),
    mobile_number: settings.mobile_number.trim(),
    logo: settings.logo.trim(),
    instagram_url: settings.instagram_url.trim(),
    facebook_url: settings.facebook_url.trim(),
    whatsapp_url: settings.whatsapp_url.trim(),
  };

  if (settings.youtube_url?.trim()) {
    payload.youtube_url = settings.youtube_url.trim();
  }

  if (settings.linkedin_url?.trim()) {
    payload.linkedin_url = settings.linkedin_url.trim();
  }

  return payload;
}
