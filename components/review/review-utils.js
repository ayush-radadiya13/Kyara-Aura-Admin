export function getReviewId(review) {
  return review?.id ?? review?._id ?? review?.review_id ?? null;
}

export function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function normalizeReview(review) {
  return {
    ...review,
    id: getReviewId(review),
    rating: Number(review?.rating ?? 0),
    review: review?.review ?? "",
    customer_name:
      review?.user?.name ??
      review?.customer_name ??
      review?.name ??
      review?.customer?.name ??
      "-",
    product_name: review?.product?.name ?? review?.product_name ?? "-",
    created_at: review?.created_at ?? null,
    on_web_show: Boolean(review?.on_web_show),
  };
}

export function normalizeReviewsResponse(data) {
  return (data?.data || data?.results || data?.reviews || []).map(
    normalizeReview
  );
}
