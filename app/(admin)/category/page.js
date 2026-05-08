"use client";

import { useMemo, useState } from "react";
import { Download, Plus, RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCategoryColumns } from "@/components/category/category-columns";
import { CategoryFormDialog } from "@/components/category/category-form-dialog";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { useCategories } from "@/hooks/admin/module/use-categories";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";
import { ADMIN_API_ROUTES } from "@/lib/routes";

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const page = Math.floor(offset / limit) + 1;

  const { data, isLoading, isFetching, refetch } = useCategories(page, limit, search);

  const categories = useMemo(() => data?.data || data?.results || [], [data]);
  const totalCount = data?.meta?.total ?? categories.length;

  const getColumns = useMemo(
    () => getCategoryColumns(actionLoading),
    [actionLoading]
  );

  const { create } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.CREATE_CATEGORIES,
    onSuccess: async (res) => {
      toast.success(res?.message || "Category created successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await refetch();
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Create failed"),
  });

  const { update } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.UPDATE_CATEGORIES,
    onSuccess: async (res) => {
      toast.success(res?.message || "Category updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await refetch();
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Update failed"),
  });

  const { remove } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.DELETE_CATEGORIES,
    onSuccess: async (res) => {
      toast.success(res?.message || "Category deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await refetch();
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Delete failed"),
  });

  const onCreateOrUpdate = async (payload) => {
    setActionLoading(true);
    try {
      if (editing) {
        await update({ ...payload, id: editing.id || editing._id });
      } else {
        await create(payload);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

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
    setOffset(0);
  };

  const tableLoading = isLoading || isFetching;

  return (
    <section>
      <PageHeader
        title="Category"
        description="Manage all category records from one place."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RotateCw className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const blob = new Blob([JSON.stringify(categories, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = "categories-export.json";
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="size-4" />
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" />
              Add Category
            </Button>
          </div>
        }
      />

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
            setOffset(newOffset);
            setLimit(newLimit);
          }}
          onEditAction={(category) => {
            setEditing(category);
            setDialogOpen(true);
          }}
          onDeleteAction={(category) =>
            onDelete(category._id ?? category.id)
          }
        />
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onCreateOrUpdate}
        loading={actionLoading}
        initialValues={editing}
      />
    </section>
  );
}
