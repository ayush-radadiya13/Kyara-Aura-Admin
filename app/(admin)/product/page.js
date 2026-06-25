"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { normalizeCategory } from "@/components/category/category-utils";
import { getProductColumns } from "@/components/product/product-columns";
import { normalizeProduct } from "@/components/product/product-utils";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/admin/module/use-categories";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { useProducts } from "@/hooks/admin/module/use-products";
import { useSizeOptions } from "@/hooks/admin/module/use-sizes";
import { cn } from "@/lib/utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { useProductStore } from "@/store/product-store";

function FilterSelect({ label, value, onChange, options, className = "w-[190px]" }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(className, "bg-white")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export default function ProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);
  const {
    search,
    category_id,
    size_id,
    min_price,
    max_price,
    is_active,
    is_collection,
    offset,
    limit,
    setSearch,
    setFilter,
    setPagination,
    resetFilters,
  } = useProductStore();

  const page = Math.floor(offset / limit) + 1;
  const filters = useMemo(
    () => ({
      search,
      category_id: category_id === "all" ? "" : category_id,
      size_id: size_id === "all" ? "" : size_id,
      price: min_price && max_price ? `${min_price}-${max_price}` : "",
      is_active: is_active === "all" ? "" : is_active,
      is_collection: is_collection === "all" ? "" : is_collection,
    }),
    [category_id, is_active, is_collection, max_price, min_price, search, size_id]
  );

  const { data, isLoading, isFetching, refetch } = useProducts(page, limit, filters);
  const { data: categoriesData } = useCategories(1, 100, "", "all");
  const { data: sizeOptions = [] } = useSizeOptions();
  const categories = useMemo(
    () => (categoriesData?.data || categoriesData?.results || []).map(normalizeCategory),
    [categoriesData]
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

  const onDelete = async () => {
    if (!productToDeleteId) return;

    setActionLoading(true);
    try {
      await remove({ _id: productToDeleteId });
      setProductToDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const hasFilters = Boolean(
    search.trim() ||
      category_id !== "all" ||
      size_id !== "all" ||
      min_price ||
      max_price ||
      is_active !== "all" ||
      is_collection !== "all"
  );

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

      <div className="mb-4 rounded-md border bg-white">
        <div className="flex items-center justify-between gap-3 p-2">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-semibold"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                filtersOpen && "rotate-180"
              )}
            />
            Product Filters
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              {filtersOpen ? "Hide" : "Show"}
            </Button>
          </div>
        </div>

        {filtersOpen ? (
          <div className="flex flex-wrap items-end gap-3 border-t p-4">
            <FilterSelect
              label="Category"
              value={category_id}
              onChange={(value) => setFilter("category_id", value)}
              options={[
                { value: "all", label: "All" },
                ...categories.map((category) => ({
                  value: String(category.id),
                  label: category.name,
                })),
              ]}
            />
            <FilterSelect
              label="Size"
              value={size_id}
              onChange={(value) => setFilter("size_id", value)}
              options={[
                { value: "all", label: "All" },
                ...sizeOptions.map((size) => ({
                  value: String(size.id),
                  label: size.name,
                })),
              ]}
              className="w-[150px]"
            />

            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Min Price
              <Input
                type="number"
                min="0"
                value={min_price}
                onChange={(event) => setFilter("min_price", event.target.value)}
                placeholder="500"
                className="w-[120px] bg-white"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Max Price
              <Input
                type="number"
                min="0"
                value={max_price}
                onChange={(event) => setFilter("max_price", event.target.value)}
                placeholder="2000"
                className="w-[120px] bg-white"
              />
            </label>

            <FilterSelect
              label="Status"
              value={is_active}
              onChange={(value) => setFilter("is_active", value)}
              options={[
                { value: "all", label: "All" },
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
              className="w-[150px]"
            />
            <FilterSelect
              label="Collection"
              value={is_collection}
              onChange={(value) => setFilter("is_collection", value)}
              options={[
                { value: "all", label: "All" },
                { value: "1", label: "Collection" },
                { value: "0", label: "Regular" },
              ]}
              className="w-[150px]"
            />
          </div>
        ) : null}
      </div>

      {!tableLoading && products.length === 0 && !hasFilters ? (
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
          onRowClickAction={handleEdit}
          onDeleteAction={(product) => setProductToDeleteId(product.id)}
        />
      )}

      <ConfirmDialog
        open={Boolean(productToDeleteId)}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setProductToDeleteId(null);
          }
        }}
        title="Delete product?"
        message="Are you sure you want to delete this product?"
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={actionLoading}
        onConfirm={onDelete}
      />
    </section>
  );
}
