export function normalizeSize(item) {
  return {
    id: item?.id ?? item?._id ?? null,
    name: item?.name ?? "",
    sort_order: item?.sort_order ?? item?.sortOrder ?? "",
    is_active: Boolean(item?.is_active),
  };
}

function toNumberOrValue(value) {
  if (value === "" || value === undefined || value === null) return value;

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

export function buildSizePayload(payload, { editValue = 0 } = {}) {
  return {
    edit_value: toNumberOrValue(editValue),
    name: payload.name ?? "",
    sort_order: Number(payload.sort_order ?? 0),
    is_active: Boolean(payload.is_active),
  };
}
