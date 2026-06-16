const metadataKeys = new Set([
  "id",
  "_id",
  "__v",
  "created_at",
  "updated_at",
  "deleted_at",
  "createdAt",
  "updatedAt",
  "deletedAt",
]);

export const defaultPromoCodeSettings = {
  promo_code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_amount: 0,
  max_discount_amount: 0,
  usage_limit: 0,
  is_active: true,
  description: "",
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isEditablePrimitive(value) {
  return ["string", "number", "boolean"].includes(typeof value) || value == null;
}

export function extractPromoCodeSettings(response) {
  const candidate =
    response?.data?.data ||
    response?.data?.result ||
    response?.data?.settings ||
    response?.data?.scratch_card_settings ||
    response?.data?.scratchCardSettings ||
    response?.data ||
    response?.result ||
    response?.settings ||
    response?.scratch_card_settings ||
    response?.scratchCardSettings ||
    response ||
    {};

  if (Array.isArray(candidate)) {
    return candidate[0] || {};
  }

  return isPlainObject(candidate) ? candidate : {};
}

export function shouldShowPromoCodeField(key, value) {
  return !metadataKeys.has(key) && isEditablePrimitive(value);
}

export function normalizePromoCodeSettings(settings) {
  const editableEntries = Object.entries(settings || {}).filter(([key, value]) =>
    shouldShowPromoCodeField(key, value)
  );

  if (editableEntries.length === 0) {
    return defaultPromoCodeSettings;
  }

  return Object.fromEntries(editableEntries);
}

export function formatPromoCodeFieldLabel(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isPromoCodeNumericField(key, value) {
  return (
    typeof value === "number" ||
    /(amount|count|days|limit|order|percentage|price|rate|value)$/i.test(key)
  );
}

export function isPromoCodeTextAreaField(key) {
  return /(description|message|note|terms|content)$/i.test(key);
}

export function buildPromoCodeSettingsPayload(settings) {
  return Object.fromEntries(
    Object.entries(settings)
      .filter(([key, value]) => shouldShowPromoCodeField(key, value))
      .map(([key, value]) => {
        if (typeof value === "string") {
          const trimmedValue = value.trim();

          if (isPromoCodeNumericField(key, value) && trimmedValue !== "") {
            return [key, Number(trimmedValue)];
          }

          return [key, trimmedValue];
        }

        return [key, value];
      })
  );
}
