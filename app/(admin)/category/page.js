"use client";

import { useMemo, useState } from "react";
import { Plus, RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCategoryColumns } from "@/components/category/category-columns";
import { CategoryFormDialog } from "@/components/category/category-form-dialog";
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

function normalizeCategory(item) {
  return {
    id: item?.id ?? item?._id ?? null,
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    description: item?.description ?? "",
    sort_order: item?.sort_order ?? 0,
    parent_id: item?.parent_id ?? item?.parent?._id ?? item?.parent?.id ?? null,
    parent_name: item?.parent?.name ?? item?.parent_name ?? "",
    is_active: Boolean(item?.is_active),
  };
}

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [editingData, setEditingData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const {
    search,
    isActiveFilter,
    offset,
    limit,
    dialogOpen,
    editingId,
    setSearch,
    setIsActiveFilter,
    setPagination,
    openCreateDialog,
    openEditDialog,
    closeDialog,
  } = useCategoryStore();

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
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
    [categories]
  );

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

  const { getById } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.GETBYID_CATEGORIES,
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to fetch category details"),
  });

  const onCreateOrUpdate = async (payload) => {
    setActionLoading(true);
    try {
      if (editingId) {
        await update({
          ...payload,
          edit_value: Number(editingId),
          id: editingId,
        });
      } else {
        await create(payload);
      }
      closeDialog();
      setEditingData(null);
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
  };

  const handleEdit = async (category) => {
    const id = category?.id;
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await getById(id);
      const payload = normalizeCategory(res?.data || res?.result || category);
      setEditingData(payload);
      openEditDialog(String(id));
    } catch (_) {
      // Error toast is handled in the mutation hook callbacks.
    } finally {
      setActionLoading(false);
    }
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
            <Button
              className="rounded-xl"
              onClick={() => {
                setEditingData(null);
                openCreateDialog();
              }}
            >
              <Plus className="mr-2 size-4" />
              Add Category
            </Button>
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

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={(value) => {
          if (!value) {
            closeDialog();
            setEditingData(null);
          }
        }}
        onSubmit={onCreateOrUpdate}
        loading={actionLoading}
        initialValues={editingData}
        categoryOptions={categoryOptions.filter(
          (option) => String(option.value) !== String(editingId)
        )}
      />
    </section>
  );
}
