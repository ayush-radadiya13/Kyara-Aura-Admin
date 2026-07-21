"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { getMainCategories } from "@/components/category/category-utils";
import {
  mainCategorySchema,
  subCategorySchema,
} from "@/validations/category-validation";
import { uploadMediaFile } from "@/services/media-service";
import { toast } from "sonner";

const defaultValues = {
  name: "",
  description: "",
  is_active: true,
  slug: "",
  image: "",
  parent_id: "",
  sort_order: 0,
};

const MAX_CATEGORY_IMAGE_SIZE = 5 * 1024 * 1024;

function resolveParentIdValue(initialValues) {
  const value =
    initialValues?.parent_id ??
    initialValues?.parentId ??
    initialValues?.parent_category_id ??
    initialValues?.parent?.id ??
    initialValues?.parent?._id;

  if (value === undefined || value === null || value === "" || value === 0 || value === "0") {
    return "";
  }

  return String(value);
}

export function CategoryForm({
  mode = "create",
  variant = "main",
  onSubmit,
  onCancel,
  loading,
  initialValues,
  categories = [],
}) {
  const isSubVariant = variant === "sub";
  const schema = isSubVariant ? subCategorySchema : mainCategorySchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const watchedName = useWatch({ control: form.control, name: "name" });
  const imageValue = useWatch({ control: form.control, name: "image" });
  const isActive = useWatch({ control: form.control, name: "is_active" });
  const parentId = useWatch({ control: form.control, name: "parent_id" });

  const parentOptions = useMemo(() => {
    const mains = getMainCategories(categories, mode === "edit" ? initialValues?.id : null);
    const selectedParentId = isSubVariant ? resolveParentIdValue(initialValues) : "";

    if (
      selectedParentId &&
      !mains.some((category) => String(category.id) === selectedParentId)
    ) {
      return [
        {
          id: selectedParentId,
          name:
            initialValues?.parent_name ||
            initialValues?.parent?.name ||
            `Category #${selectedParentId}`,
        },
        ...mains,
      ];
    }

    return mains;
  }, [categories, initialValues, isSubVariant, mode]);

  useEffect(() => {
    if (initialValues) {
      const imageUrl = initialValues.image_url || initialValues.image || "";
      const parentIdValue = isSubVariant ? resolveParentIdValue(initialValues) : "";

      form.reset({
        name: initialValues.name || "",
        description: initialValues.description || "",
        is_active: Boolean(initialValues.is_active),
        slug: initialValues.slug || "",
        image: imageUrl,
        parent_id: parentIdValue,
        sort_order: Number(initialValues.sort_order ?? 0) || 0,
      });

      if (isSubVariant && parentIdValue) {
        const timer = setTimeout(() => {
          form.setValue("parent_id", parentIdValue, {
            shouldDirty: false,
            shouldValidate: true,
          });
        }, 0);

        return () => clearTimeout(timer);
      }

      return;
    }

    form.reset({
      ...defaultValues,
      parent_id: "",
    });
  }, [initialValues, form, isSubVariant]);

  useEffect(() => {
    if (!isSubVariant || !initialValues || parentOptions.length === 0) return;

    const selectedParentId = resolveParentIdValue(initialValues);
    if (!selectedParentId) return;

    const currentParentId = String(form.getValues("parent_id") || "");
    const hasSelectedOption = parentOptions.some(
      (category) => String(category.id) === selectedParentId
    );

    if (hasSelectedOption && currentParentId !== selectedParentId) {
      form.setValue("parent_id", selectedParentId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [form, initialValues, isSubVariant, parentOptions]);

  const slugEditedManually = Boolean(form.formState.dirtyFields.slug);

  useEffect(() => {
    if (!watchedName) return;

    const generated = watchedName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (mode === "create" && !slugEditedManually) {
      form.setValue("slug", generated, { shouldValidate: true, shouldDirty: false });
    }
  }, [watchedName, mode, form, slugEditedManually]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_CATEGORY_IMAGE_SIZE) {
      toast.error("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadMediaFile(file, "categories");

      form.setValue("image", imageUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Image upload failed");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const removeImage = () => {
    form.setValue("image", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const submitHandler = form.handleSubmit((values) => {
    onSubmit({
      ...values,
      parent_id: isSubVariant ? values.parent_id : "",
    });
  });

  const entityLabel = isSubVariant ? "subcategory" : "category";

  return (
    <form onSubmit={submitHandler} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          <Label>{isSubVariant ? "Subcategory Image" : "Category Image"}</Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="category-image-upload"
            disabled={isUploadingImage}
          />
          <label
            htmlFor="category-image-upload"
            className={`group relative flex h-[185px] w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-muted/30 transition-colors ${
              isUploadingImage
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer hover:border-primary/60 hover:bg-muted/50"
            }`}
            aria-label={`Upload ${entityLabel} image`}
          >
            {imageValue ? (
              <>
                <Image
                  src={imageValue}
                  alt={`${isSubVariant ? "Subcategory" : "Category"} image`}
                  fill
                  sizes="280px"
                  unoptimized
                  className="object-cover"
                />
                <span className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md ring-1 ring-border transition-colors group-hover:text-primary">
                  {isUploadingImage ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Upload className="size-5" />
                  )}
                </span>
                {isUploadingImage ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <Loader2 className="size-7 animate-spin text-white" />
                  </span>
                ) : null}
              </>
            ) : (
              <span className="flex flex-col items-center justify-center px-4 text-center">
                {isUploadingImage ? (
                  <Loader2 className="mb-2 size-8 animate-spin text-gray-400" />
                ) : (
                  <Upload className="mb-2 size-8 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  {isUploadingImage ? "Uploading image..." : "Click to upload image"}
                </span>
                <span className="text-xs text-gray-500">Max 5 MB</span>
              </span>
            )}
          </label>
          {imageValue && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeImage}
              disabled={loading || isUploadingImage}
              className="border-border bg-white text-foreground hover:bg-white"
            >
              <X className="mr-2 size-4" />
              Remove image
            </Button>
          )}
          {form.formState.errors.image && (
            <p className="text-sm text-destructive">{form.formState.errors.image.message}</p>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <div className="ml-auto flex w-full items-center justify-between gap-4 sm:w-fit">
              <Label htmlFor="is_active">
                Active {isSubVariant ? "subcategory" : "category"}
              </Label>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) =>
                  form.setValue("is_active", checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>
            {form.formState.errors.is_active && (
              <p className="mt-2 text-sm text-destructive">
                {form.formState.errors.is_active.message}
              </p>
            )}
          </div>

          {isSubVariant ? (
            <div className="space-y-2">
              <Label htmlFor="parent_id">Main Category</Label>
              <Select
                value={parentId ? String(parentId) : undefined}
                onValueChange={(value) =>
                  form.setValue("parent_id", String(value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="parent_id" className="h-10 w-full">
                  <SelectValue placeholder="Select a main category" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  avoidCollisions={false}
                  position="popper"
                  side="bottom"
                  sideOffset={4}
                >
                  {parentOptions.map((category) => (
                    <SelectItem key={String(category.id)} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {parentOptions.length === 0
                  ? "Create a main category first before adding a subcategory."
                  : "Choose the main category this subcategory belongs to."}
              </p>
              {form.formState.errors.parent_id && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.parent_id.message}
                </p>
              )}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                {isSubVariant ? "Subcategory Name" : "Category Name"}
              </Label>
              <Input
                id="name"
                placeholder={
                  isSubVariant ? "Enter a subcategory name" : "Enter a category name"
                }
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="Enter a slug" {...form.register("slug")} />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a description"
              className="min-h-[96px] resize-none"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-border bg-white text-foreground hover:bg-white"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading || isUploadingImage}
          className="bg-green-600 text-white hover:bg-green-600/90"
        >
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}
