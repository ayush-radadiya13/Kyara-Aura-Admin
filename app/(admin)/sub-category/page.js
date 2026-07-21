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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { useCategories } from "@/hooks/admin/module/use-categories";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { useSubCategoryStore } from "@/store/sub-category-store";

export default function SubCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState(null);
  const { search, offset, limit, setSearch, setPagination } = useSubCategoryStore();
  const page = Math.floor(offset / limit) + 1;

  const { data, isLoading, isFetching, refetch } = useCategories(
    page,
    limit,
    search,
    "all",
    "sub"
  );
  const { data: mainCategoriesData } = useCategories(1, 10, "", "all", "main");

  const categories = useMemo(() => {
    const normalized = (data?.data || data?.results || []).map(normalizeCategory);
    const mains = (mainCategoriesData?.data || mainCategoriesData?.results || []).map(
      normalizeCategory
    );
    const byId = new Map(mains.map((item) => [String(item.id), item]));
    return normalized.map((item) => ({
      ...item,
      parent_name: item.parent_name || byId.get(String(item.parent_id))?.name || "",
    }));
  }, [data, mainCategoriesData]);

  const totalCount = data?.meta?.total ?? data?.total ?? categories.length;

  const getColumns = useMemo(
    () => getCategoryColumns(actionLoading, offset, { variant: "sub" }),
    [actionLoading, offset]
  );

  const { remove } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.DELETE_CATEGORIES,
    onSuccess: async (res) => {
      toast.success(res?.message || "Subcategory deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await refetch();
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Delete failed"),
  });

  const onDelete = async () => {
    if (!categoryToDeleteId) return;

    setActionLoading(true);
    try {
      await remove({ _id: categoryToDeleteId });
      setCategoryToDeleteId(null);
    } catch (_) {
      // Error toast is handled in the mutation hook callbacks.
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
    router.push(`/sub-category/edit/${id}`);
  };

  const tableLoading = isLoading || isFetching;

  return (
    <section>
      <PageHeader
        title="Sub Category"
        description="Manage subcategories under your main categories."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RotateCw className="size-4" />
            </Button>
            <Link href="/sub-category/create">
              <Button>
                <Plus className="mr-2 size-4" />
                Add Sub Category
              </Button>
            </Link>
          </div>
        }
      />

      {!tableLoading && categories.length === 0 && !search.trim() ? (
        <EmptyState
          title="No subcategories yet"
          description="Create a subcategory and assign it to a main category."
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
          onDeleteAction={(category) => setCategoryToDeleteId(category.id)}
        />
      )}

      <ConfirmDialog
        open={Boolean(categoryToDeleteId)}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setCategoryToDeleteId(null);
          }
        }}
        title="Delete subcategory?"
        message="Are you sure you want to delete this subcategory?"
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={actionLoading}
        onConfirm={onDelete}
      />
    </section>
  );
}
