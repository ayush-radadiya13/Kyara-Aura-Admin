"use client";

import { useMemo } from "react";
import {
  normalizeOrdersResponse,
  useOrders,
} from "@/hooks/admin/module/use-orders";
import {
  normalizeReturnOrdersResponse,
  useReturnOrders,
} from "@/hooks/admin/module/use-return-orders";

function getTotalCount(data) {
  return data?.meta?.total ?? data?.total ?? 0;
}

function mergeById(items, getId) {
  const map = new Map();

  items.forEach((item) => {
    const id = getId(item);
    if (id != null && id !== "") {
      map.set(String(id), item);
    }
  });

  return [...map.values()];
}

function sortByCreatedAtDesc(items, dateKey = "created_at") {
  return [...items].sort((a, b) => {
    const aTime = new Date(String(a?.[dateKey] || "").replace(" ", "T")).getTime();
    const bTime = new Date(String(b?.[dateKey] || "").replace(" ", "T")).getTime();

    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  });
}

export function useCombinedOrders(page, pageSize, filters) {
  const codQuery = useOrders(page, pageSize, filters, "cod");
  const onlineQuery = useOrders(page, pageSize, filters, "online");

  const orders = useMemo(() => {
    const codOrders = normalizeOrdersResponse(codQuery.data);
    const onlineOrders = normalizeOrdersResponse(onlineQuery.data);

    return sortByCreatedAtDesc(
      mergeById([...codOrders, ...onlineOrders], (order) => order?.id)
    );
  }, [codQuery.data, onlineQuery.data]);

  const totalCount =
    getTotalCount(codQuery.data) + getTotalCount(onlineQuery.data);

  return {
    orders,
    totalCount,
    isLoading: codQuery.isLoading || onlineQuery.isLoading,
    isFetching: codQuery.isFetching || onlineQuery.isFetching,
    refetch: async () => {
      await Promise.all([codQuery.refetch(), onlineQuery.refetch()]);
    },
  };
}

export function useCombinedReturnOrders(page, pageSize, filters) {
  const codQuery = useReturnOrders(page, pageSize, filters, "cod");
  const onlineQuery = useReturnOrders(page, pageSize, filters, "online");

  const returnOrders = useMemo(() => {
    const codReturns = normalizeReturnOrdersResponse(codQuery.data);
    const onlineReturns = normalizeReturnOrdersResponse(onlineQuery.data);

    return sortByCreatedAtDesc(
      mergeById(
        [...codReturns, ...onlineReturns],
        (item) => item?.return_request_id || item?.id
      ),
      "requested_at"
    );
  }, [codQuery.data, onlineQuery.data]);

  const totalCount =
    getTotalCount(codQuery.data) + getTotalCount(onlineQuery.data);

  return {
    returnOrders,
    totalCount,
    isLoading: codQuery.isLoading || onlineQuery.isLoading,
    isFetching: codQuery.isFetching || onlineQuery.isFetching,
    refetch: async () => {
      await Promise.all([codQuery.refetch(), onlineQuery.refetch()]);
    },
  };
}
