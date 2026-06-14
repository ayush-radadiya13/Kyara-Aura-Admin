"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSizeColumns } from "@/components/size/size-columns";
import { buildSizePayload, normalizeSize } from "@/components/size/size-utils";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { SIZES_ENDPOINT, useSizes } from "@/hooks/admin/module/use-sizes";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";
import { customAxios } from "@/utils/api";

const defaultFormValues = {
  id: null,
  name: "",
  sort_order: 1,
  is_active: true,
};

export function SizeManager() {
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("all");
  const [formValues, setFormValues] = useState(defaultFormValues);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingLoadingId, setEditingLoadingId] = useState(null);
  const [sizeToDeleteId, setSizeToDeleteId] = useState(null);

  const page = Math.floor(offset / limit) + 1;
  const { data, isLoading, isFetching, refetch } = useSizes(
    page,
    limit,
    search,
    isActiveFilter
  );

  const sizes = useMemo(
    () => (data?.data || data?.results || []).map(normalizeSize),
    [data]
  );
  const totalCount = data?.meta?.total ?? sizes.length;
  const tableLoading = isLoading || isFetching;

  const columns = useMemo(
    () => getSizeColumns(actionLoading || Boolean(editingLoadingId), offset),
    [actionLoading, editingLoadingId, offset]
  );

  const { create: saveSize, remove } = useCrudMutation({
    baseUrl: SIZES_ENDPOINT,
    onSuccess: async (res, action) => {
      toast.success(
        res?.message ||
          (action === "delete" ? "Size deleted successfully" : "Size saved successfully")
      );
      await queryClient.invalidateQueries({ queryKey: ["sizes"] });
      await refetch();
    },
    onError: (error, action) =>
      toast.error(
        error?.response?.data?.message || (action === "delete" ? "Delete failed" : "Save failed")
      ),
  });

  const openCreateDialog = () => {
    setFormValues(defaultFormValues);
    setDialogOpen(true);
  };

  const handleEdit = async (size) => {
    if (!size?.id) return;

    setEditingLoadingId(size.id);
    try {
      const res = await customAxios.get(`${SIZES_ENDPOINT}/${size.id}`);
      const detail = normalizeSize(res.data?.data || res.data?.result || res.data);

      setFormValues({
        id: detail.id || size.id,
        name: detail.name,
        sort_order: detail.sort_order || 1,
        is_active: detail.is_active,
      });
      setDialogOpen(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch size details");
    } finally {
      setEditingLoadingId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.name.trim()) {
      toast.error("Size name is required");
      return;
    }

    setActionLoading(true);
    try {
      await saveSize(
        buildSizePayload(formValues, {
          editValue: formValues.id || 0,
        })
      );
      setDialogOpen(false);
      setFormValues(defaultFormValues);
    } catch (_) {
      // Error toast is handled in the mutation hook callbacks.
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sizeToDeleteId) return;

    setActionLoading(true);
    try {
      await remove({ _id: sizeToDeleteId });
      setSizeToDeleteId(null);
    } catch (_) {
      // Error toast is handled in the mutation hook callbacks.
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="All sizes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-border bg-white text-foreground hover:bg-white"
          >
            {isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCw className="size-4" />
            )}
          </Button>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="mr-2 size-4" />
            Add Size
          </Button>
        </div>
      </div>

      {!tableLoading && sizes.length === 0 && !search.trim() ? (
        <EmptyState
          title="No sizes yet"
          description="Create your first size to make it available in product forms."
        />
      ) : (
        <DataTableWrapper
          offset={offset}
          limit={limit}
          total={totalCount}
          search={search}
          data={sizes}
          isLoading={tableLoading}
          getColumns={columns}
          onSearchAction={setSearch}
          onPageChangeAction={(newOffset, newLimit) => {
            setOffset(newOffset);
            setLimit(newLimit);
          }}
          onEditAction={handleEdit}
          onDeleteAction={(size) => setSizeToDeleteId(size.id)}
        />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setFormValues(defaultFormValues);
          }
          setDialogOpen(open);
        }}
      >
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{formValues.id ? "Edit Size" : "Add Size"}</DialogTitle>
              <DialogDescription>
                Sizes are saved with name, sort order, active status, and edit value.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="size-name">Name</Label>
              <Input
                id="size-name"
                placeholder="Small"
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size-sort-order">Sort Order</Label>
              <Input
                id="size-sort-order"
                type="number"
                min="0"
                placeholder="1"
                value={formValues.sort_order}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    sort_order: event.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
              <Label htmlFor="size-is-active">Active</Label>
              <Switch
                id="size-is-active"
                checked={formValues.is_active}
                onCheckedChange={(checked) =>
                  setFormValues((current) => ({
                    ...current,
                    is_active: checked,
                  }))
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {formValues.id ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(sizeToDeleteId)}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setSizeToDeleteId(null);
          }
        }}
        title="Delete size?"
        message="Are you sure you want to delete this size?"
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={actionLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
