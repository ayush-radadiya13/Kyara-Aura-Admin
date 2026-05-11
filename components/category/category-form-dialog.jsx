"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
import { categorySchema } from "@/validations/category-validation";

const defaultValues = {
  name: "",
  description: "",
  parent_id: "none",
  sort_order: 1,
  is_active: true,
  slug: "",
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
  initialValues,
  categoryOptions = [],
}) {
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name || "",
        description: initialValues.description || "",
        parent_id:
          initialValues.parent_id ?? initialValues.parent?._id ?? initialValues.parent?.id ?? "none",
        sort_order: initialValues.sort_order ?? 1,
        is_active: Boolean(initialValues.is_active),
        slug: initialValues.slug || "",
      });
      return;
    }
    form.reset(defaultValues);
  }, [initialValues, form, open]);

  const watchedName = form.watch("name");
  const currentSlug = form.watch("slug");
  const slugEditedManually = Boolean(form.formState.dirtyFields.slug);

  useEffect(() => {
    if (!watchedName) return;

    const generated = watchedName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (!initialValues && !slugEditedManually) {
      form.setValue("slug", generated, { shouldValidate: true, shouldDirty: false });
    }
  }, [watchedName, currentSlug, initialValues, form, slugEditedManually]);

  const submitHandler = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      parent_id: values.parent_id === "none" ? null : values.parent_id,
    });
    form.reset(defaultValues);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            Maintain product categories with a clean structure.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" placeholder="e.g. Apparel" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="e.g. rings"
              {...form.register("slug")}
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Short details about the category"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select
                value={form.watch("parent_id") ?? "none"}
                onValueChange={(value) =>
                  form.setValue("parent_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root Category)</SelectItem>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.parent_id && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.parent_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input id="sort_order" type="number" min={0} {...form.register("sort_order")} />
              {form.formState.errors.sort_order && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.sort_order.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.watch("is_active")}
              onChange={(e) =>
                form.setValue("is_active", e.target.checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="size-4 rounded border border-input"
            />
            <Label htmlFor="is_active">Active category</Label>
          </div>
          {form.formState.errors.is_active && (
            <p className="text-sm text-destructive">
              {form.formState.errors.is_active.message}
            </p>
          )}

          <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
            Slug is auto-generated from name for new categories, and can be edited manually.
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {initialValues ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
