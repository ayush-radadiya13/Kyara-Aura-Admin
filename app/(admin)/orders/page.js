"use client";

import { useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { getOrderColumns } from "@/components/order/order-columns";
import { OrderDetailsDrawer } from "@/components/order/order-details-drawer";
import { buildOrderItemRows } from "@/components/order/order-utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  normalizeOrdersResponse,
  useOrderDetails,
  useOrders,
} from "@/hooks/admin/module/use-orders";
import { useOrderStore } from "@/store/order-store";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { search, offset, limit, setSearch, setPagination } = useOrderStore();

  const page = Math.floor(offset / limit) + 1;
  const { data, isLoading, isFetching, refetch } = useOrders(page, limit, search);

  const orders = useMemo(() => normalizeOrdersResponse(data), [data]);
  const orderItemRows = useMemo(() => buildOrderItemRows(orders), [orders]);
  const totalCount = data?.meta?.total ?? orders.length;

  const {
    data: orderDetails,
    isLoading: isOrderDetailsLoading,
    isFetching: isOrderDetailsFetching,
  } = useOrderDetails(selectedOrder?.id, isDetailsOpen);

  const getColumns = useMemo(
    () => getOrderColumns(isLoading || isFetching),
    [isLoading, isFetching]
  );

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleDetailsOpenChange = (open) => {
    setIsDetailsOpen(open);

    if (!open) {
      setSelectedOrder(null);
    }
  };

  const tableLoading = isLoading || isFetching;
  const activeOrder = orderDetails || selectedOrder;

  return (
    <section>
      <PageHeader
        title="Orders"
        description="Track and manage customer order activity."
        action={
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RotateCw className="size-4" />
          </Button>
        }
      />

      {!tableLoading && orderItemRows.length === 0 && !search.trim() ? (
        <EmptyState
          title="No orders yet"
          description="Customer orders will appear here once available."
        />
      ) : (
        <DataTableWrapper
          offset={offset}
          limit={limit}
          total={totalCount}
          search={search}
          data={orderItemRows}
          isLoading={tableLoading}
          getColumns={getColumns}
          onSearchAction={setSearch}
          onPageChangeAction={(newOffset, newLimit) => {
            setPagination({ offset: newOffset, limit: newLimit });
          }}
          onEditAction={handleViewDetails}
        />
      )}

      <OrderDetailsDrawer
        open={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        order={activeOrder}
        isLoading={isOrderDetailsLoading || isOrderDetailsFetching}
      />
    </section>
  );
}
