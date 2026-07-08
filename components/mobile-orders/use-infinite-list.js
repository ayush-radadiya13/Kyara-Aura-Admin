"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useInfiniteList({
  items,
  totalCount,
  page,
  isLoading,
  isFetching,
  onLoadMore,
  resetKey,
}) {
  const [accumulatedItems, setAccumulatedItems] = useState([]);
  const previousResetKey = useRef(resetKey);

  useEffect(() => {
    if (previousResetKey.current !== resetKey) {
      previousResetKey.current = resetKey;
      setAccumulatedItems([]);
    }
  }, [resetKey]);

  useEffect(() => {
    if (isLoading && page === 1) return;

    if (!items?.length && page === 1 && !isFetching) {
      setAccumulatedItems([]);
      return;
    }

    setAccumulatedItems((current) => {
      if (page === 1) {
        return items;
      }

      const existingIds = new Set(
        current.map((item) => item.id ?? item.return_request_id)
      );

      const nextItems = items.filter(
        (item) => !existingIds.has(item.id ?? item.return_request_id)
      );

      return nextItems.length > 0 ? [...current, ...nextItems] : current;
    });
  }, [items, page, isLoading, isFetching]);

  const hasMore = accumulatedItems.length < totalCount;

  const loadMore = useCallback(() => {
    if (!hasMore || isFetching) return;
    onLoadMore();
  }, [hasMore, isFetching, onLoadMore]);

  const isInitialLoading = isLoading && page === 1 && accumulatedItems.length === 0;

  return useMemo(
    () => ({
      accumulatedItems,
      hasMore,
      loadMore,
      isInitialLoading,
      isLoadingMore: isFetching && page > 1,
    }),
    [accumulatedItems, hasMore, isInitialLoading, isFetching, loadMore, page]
  );
}
