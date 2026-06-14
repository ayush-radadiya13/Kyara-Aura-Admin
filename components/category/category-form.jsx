"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

const MAX_CATEGORY_IMAGE_SIZE = 5 * 1024 * 1024;

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const watchedName = useWatch({ control: form.control, name: "name" });
  const imageValue = useWatch({ control: form.control, name: "image" });
  const isActive = useWatch({ control: form.control, name: "is_active" });

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
      return;
    }
    form.reset(defaultValues);
  }, [initialValues, form]);

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

  const submitHandler = form.handleSubmit(onSubmit);

  return (
    <form onSubmit={submitHandler} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          <Label>Category Image</Label>
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
            aria-label="Upload category image"
          >
            {imageValue ? (
              <>
                <Image
                  src={imageValue}
                  alt="Category image"
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
              <Label htmlFor="is_active">Active category</Label>
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

          <div className="grid gap-4 md:grid-cols-2">
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
