"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCategoryColumns } from "@/components/category/category-columns";
import { normalizeCategory } from "@/components/category/category-utils";
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
import { useCategories } from "@/hooks/admin/module/use-categories";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { useCategoryStore } from "@/store/category-store";

export default function CategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const { search, isActiveFilter, offset, limit, setSearch, setIsActiveFilter, setPagination } =
    useCategoryStore();

  const page = Math.floor(offset / limit) + 1;

  const { data, isLoading, isFetching, refetch } = useCategories(
    page,
    limit,
    search,
    isActiveFilter
  );

  const categories = useMemo(
    () => (data?.data || data?.results || []).map(normalizeCategory),
    [data]
  );
  const totalCount = data?.meta?.total ?? categories.length;

  const getColumns = useMemo(
    () => getCategoryColumns(actionLoading),
    [actionLoading]
  );

  const { remove } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.DELETE_CATEGORIES,
    onSuccess: async (res) => {
      toast.success(res?.message || "Category deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
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

  const handleEdit = (category) => {
    const id = category?.id;
    if (!id) return;
    router.push(`/category/edit/${id}`);
  };

  const tableLoading = isLoading || isFetching;

  return (
    <section>
      <PageHeader
        title="Category"
        description="Manage all category records from one place."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RotateCw className="size-4" />
            </Button>
            <Link href="/category/create">
              <Button>
                <Plus className="mr-2 size-4" />
                Add Category
              </Button>
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!tableLoading && categories.length === 0 && !search.trim() ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category to begin organizing items."
        />
      ) : (
        <DataTableWrapper
          offset={offset}
          limit={limit}
          total={totalCount}
          search={search}
          data={categories}
          isLoading={tableLoading}
          getColumns={getColumns}
          onSearchAction={handleSearch}
          onPageChangeAction={(newOffset, newLimit) => {
            setPagination({ offset: newOffset, limit: newLimit });
          }}
          onEditAction={handleEdit}
          onDeleteAction={(category) => onDelete(category.id)}
        />
      )}
    </section>
  );
}
