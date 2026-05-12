"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProductColumns } from "@/components/product/product-columns";
import { normalizeProduct } from "@/components/product/product-utils";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { useProducts } from "@/hooks/admin/module/use-products";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { useProductStore } from "@/store/product-store";

export default function ProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const { search, isActiveFilter, offset, limit, setSearch, setIsActiveFilter, setPagination } =
    useProductStore();

  const page = Math.floor(offset / limit) + 1;

  const { data, isLoading, isFetching, refetch } = useProducts(
    page,
    limit,
    search,
    isActiveFilter
  );

  const products = useMemo(
    () => (data?.data || data?.results || []).map(normalizeProduct),
    [data]
  );
  const totalCount = data?.meta?.total ?? products.length;

  const getColumns = useMemo(
    () => getProductColumns(actionLoading),
    [actionLoading]
  );

  const { remove } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.DELETE_PRODUCTS,
    onSuccess: async (res) => {
      toast.success(res?.message || "Product deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await refetch();
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Delete failed"),
  });

  const onDelete = async (id) => {
    setActionLoading(true);
    try {
      await remove({ _id: id });
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleEdit = (product) => {
    const id = product?.id;
    if (!id) return;
    router.push(`/product/edit/${id}`);
  };

  const tableLoading = isLoading || isFetching;

  return (
    <section>
      <PageHeader
        title="Product"
        description="Manage all product records from one place."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RotateCw className="size-4" />
            </Button>
            <Link href="/product/create">
              <Button>
                <Plus className="mr-2 size-4" />
                Add Product
              </Button>
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!tableLoading && products.length === 0 && !search.trim() ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to begin managing inventory."
        />
      ) : (
        <DataTableWrapper
          offset={offset}
          limit={limit}
          total={totalCount}
          search={search}
          data={products}
          isLoading={tableLoading}
          getColumns={getColumns}
          onSearchAction={handleSearch}
          onPageChangeAction={(newOffset, newLimit) => {
            setPagination({ offset: newOffset, limit: newLimit });
          }}
          onEditAction={handleEdit}
          onDeleteAction={(product) => onDelete(product.id)}
        />
      )}
    </section>
  );
}
