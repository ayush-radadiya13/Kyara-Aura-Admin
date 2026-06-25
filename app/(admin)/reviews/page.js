"use client";

import { useCallback, useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { getReviewColumns } from "@/components/review/review-columns";
import { normalizeReviewsResponse } from "@/components/review/review-utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  useReviews,
  useUpdateReviewVisibility,
} from "@/hooks/admin/module/use-reviews";
import { useReviewStore } from "@/store/review-store";

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [actionReviewId, setActionReviewId] = useState(null);
  const { search, offset, limit, setSearch, setPagination } = useReviewStore();

  const page = Math.floor(offset / limit) + 1;
  const filters = useMemo(() => ({ search }), [search]);

  const { data, isLoading, isFetching, refetch } = useReviews(
    page,
    limit,
    filters
  );
  const reviews = useMemo(() => normalizeReviewsResponse(data), [data]);
  const totalCount = data?.meta?.total ?? data?.total ?? reviews.length;

  const refreshReviews = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["customer-reviews"] });
    await refetch();
  }, [queryClient, refetch]);

  const { mutate: updateVisibility, isPending: isUpdating } =
    useUpdateReviewVisibility({
      onSuccess: async (res, variables) => {
        toast.success(
          res?.message ||
            (variables?.on_web_show
              ? "Review is now visible on the website"
              : "Review hidden from the website")
        );
        await refreshReviews();
      },
      onError: (error) =>
        toast.error(
          error?.response?.data?.message || "Failed to update review visibility"
        ),
      onSettled: () => setActionReviewId(null),
    });

  const handleToggleVisibility = useCallback(
    (review, checked) => {
      const reviewId = review?.id;
      if (!reviewId) return;

      setActionReviewId(reviewId);
      updateVisibility({ reviewId, on_web_show: checked });
    },
    [updateVisibility]
  );

  const tableLoading = isLoading || isFetching;
  const getColumns = useMemo(
    () =>
      getReviewColumns(tableLoading || isUpdating, {
        onToggleVisibility: handleToggleVisibility,
        actionReviewId,
      }),
    [actionReviewId, handleToggleVisibility, isUpdating, tableLoading]
  );

  const hasFilters = Boolean(search.trim());

  return (
    <section>
      <PageHeader
        title="Reviews"
        description="Manage customer reviews and choose which ones appear on the website."
        action={
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RotateCw className="size-4" />
          </Button>
        }
      />

      {!tableLoading && reviews.length === 0 && !hasFilters ? (
        <EmptyState
          title="No reviews yet"
          description="Customer reviews will appear here once available."
        />
      ) : (
        <DataTableWrapper
          offset={offset}
          limit={limit}
          total={totalCount}
          search={search}
          data={reviews}
          isLoading={tableLoading}
          getColumns={getColumns}
          onSearchAction={setSearch}
          onPageChangeAction={(newOffset, newLimit) => {
            setPagination({ offset: newOffset, limit: newLimit });
          }}
        />
      )}
    </section>
  );
}
