"use client";

import { useMemo, useState } from "react";
import { Download, Plus, RotateCw, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryFormDialog } from "@/components/category/category-form-dialog";
import { CategoryTable } from "@/components/category/category-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { useCategories } from "@/hooks/admin/module/use-categories";
import { ADMIN_API_ROUTES } from "@/lib/routes";

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading, isFetching, refetch } = useCategories(
    page,
    pageSize,
    appliedSearch
  );

  const categories = useMemo(() => data?.data || data?.results || [], [data]);
  const totalCount = data?.meta?.total || categories.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

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

      <div className="mb-4 flex items-center gap-2">
        <Input
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Search categories..."
          className="max-w-sm"
        />
        <Button
          onClick={() => {
            setAppliedSearch(searchDraft);
            setPage(1);
          }}
        >
          <Search className="mr-2 size-4" />
          Search
        </Button>
      </div>

      {isLoading || isFetching ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : categories.length ? (
        <CategoryTable
          categories={categories}
          loading={actionLoading}
          onEdit={(category) => {
            setEditing(category);
            setDialogOpen(true);
          }}
          onDelete={onDelete}
        />
      ) : (
        <EmptyState
          title="No categories yet"
          description="Create your first category to begin organizing items."
        />
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onCreateOrUpdate}
        loading={actionLoading}
        initialValues={editing}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
