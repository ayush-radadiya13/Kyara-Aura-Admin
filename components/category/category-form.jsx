"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { categorySchema } from "@/validations/category-validation";
import { uploadMediaFile } from "@/services/media-service";
import { toast } from "sonner";

const defaultValues = {
  name: "",
  description: "",
  is_active: true,
  slug: "",
  image: "",
};

export function CategoryForm({
  mode = "create",
  onSubmit,
  onCancel,
  loading,
  initialValues,
}) {
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (initialValues) {
      const imageUrl = initialValues.image_url || initialValues.image || "";

      form.reset({
        name: initialValues.name || "",
        description: initialValues.description || "",
        is_active: Boolean(initialValues.is_active),
        slug: initialValues.slug || "",
        image: imageUrl,
      });
      setPreviewImage(
        imageUrl
          ? { preview: imageUrl, name: "Category image", isExisting: true }
          : null
      );
      return;
    }
    form.reset(defaultValues);
    setPreviewImage(null);
  }, [initialValues, form]);

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

    if (mode === "create" && !slugEditedManually) {
      form.setValue("slug", generated, { shouldValidate: true, shouldDirty: false });
    }
  }, [watchedName, currentSlug, mode, form, slugEditedManually]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be 2MB or smaller.");
      event.target.value = "";
      return;
    }

    if (previewImage?.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage.preview);
    }

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadMediaFile(file, "categories");

      setPreviewImage({
        preview: imageUrl,
        name: file.name,
        isExisting: false,
      });
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
    if (previewImage?.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage.preview);
    }

    setPreviewImage(null);
    form.setValue("image", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const submitHandler = form.handleSubmit(onSubmit);

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" placeholder="Enter a category name" {...form.register("name")} />
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Enter a Description"
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Category Image</Label>
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
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
            className={`flex flex-col items-center justify-center ${
              isUploadingImage ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isUploadingImage ? (
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
            ) : (
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {isUploadingImage ? "Uploading image..." : "Click to upload image"}
            </span>
            <span className="text-xs text-gray-500">Max 2MB</span>
          </label>
        </div>

        {previewImage && (
          <div className="mt-2 w-28">
            <div className="group relative">
              <Image
                src={previewImage.preview}
                alt={previewImage.name || "Category image"}
                width={112}
                height={80}
                unoptimized
                className="h-20 w-full rounded border object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
        {form.formState.errors.image && (
          <p className="text-sm text-destructive">{form.formState.errors.image.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="is_active">Active category</Label>
        <Switch
          id="is_active"
          checked={form.watch("is_active")}
          onCheckedChange={(checked) =>
            form.setValue("is_active", checked, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </div>
      {form.formState.errors.is_active && (
        <p className="text-sm text-destructive">{form.formState.errors.is_active.message}</p>
      )}

      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        Slug is auto-generated from name for new categories, and can be edited manually.
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
