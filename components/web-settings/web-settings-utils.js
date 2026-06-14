export const defaultWebSettings = {
  email: "",
  address: "",
  mobile_number: "",
  logo: "",
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
  };
}

export function buildWebSettingsPayload(settings) {
  return {
    email: settings.email.trim(),
    address: settings.address.trim(),
    mobile_number: settings.mobile_number.trim(),
    logo: settings.logo.trim(),
  };
}
