"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productSchema } from "@/validations/product-validation";
import { uploadMediaFile } from "@/services/media-service";
import { toast } from "sonner";

const defaultValues = {
  name: "",
  slug: "",
  description: "",
  short_description: "",
  category_id: "",
  discount_percentage: 0,
  weight_grams: "",
  brand: "",
  base_material: "",
  plating: "",
  gemstone: "",
  design: "",
  occasion: "",
  ideal_for: "",
  package_contents: "",
  is_active: true,
  is_collection: false,
  images: [],
  video: "",
  sizes: [{ size_id: "", quantity: "", price: "" }],
};

const MAX_VIDEO_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 4;
const MAX_VIDEOS = 1;
const MAX_MEDIA = 5;
const MEDIA_PREVIEW_CLASS = "h-[100px] w-[100px] rounded border object-cover";

const compactInputClass = "h-10 px-3 py-2 text-sm";
const compactSelectClass = "h-10 w-full px-3 py-2 text-sm";
const idealForOptions = [
  { label: "Man", value: "men" },
  { label: "Woman", value: "woman" },
  { label: "Both", value: "both" },
];

const productDetailFields = [
  { name: "brand", label: "Brand", placeholder: "Enter brand" },
  { name: "base_material", label: "Base Material", placeholder: "e.g. Brass, Silver" },
  { name: "plating", label: "Plating", placeholder: "e.g. Gold plated" },
  { name: "gemstone", label: "Gemstone", placeholder: "e.g. Pearl, Zircon" },
  { name: "design", label: "Design", placeholder: "Enter design" },
  { name: "occasion", label: "Occasion", placeholder: "e.g. Wedding, Daily wear" },
];

function normalizePreviewImage(image) {
  if (typeof image === "string") {
    return { preview: image, name: "Image", isExisting: true };
  }

  const preview =
    image?.preview ||
    image?.url ||
    image?.image_url ||
    image?.path ||
    image?.file ||
    image?.location ||
    image?.secure_url ||
    image?.image ||
    "";

  return preview
    ? {
        ...image,
        preview,
        name: image?.name || "Image",
        isExisting: image?.isExisting ?? true,
      }
    : null;
}

function normalizeCategoryLabel(value) {
  return String(value || "").trim().toLowerCase();
}

function resolveInitialCategoryId(initialValues) {
  const value =
    initialValues?.category_id ??
    initialValues?.categoryId ??
    initialValues?.categoryID ??
    initialValues?.category?.id ??
    initialValues?.category?._id;

  return value !== undefined && value !== null && value !== "" ? String(value) : "";
}

function resolveInitialCategoryName(initialValues) {
  return (
    initialValues?.category_name ||
    initialValues?.categoryName ||
    initialValues?.category?.name ||
    initialValues?.category?.title ||
    initialValues?.category?.label ||
    (typeof initialValues?.category === "string" ? initialValues.category : "")
  );
}

function resolveCategoryIdFromOptions(initialValues, categoryOptions) {
  const categoryId = resolveInitialCategoryId(initialValues);

  if (categoryId) {
    return categoryId;
  }

  const categoryName = resolveInitialCategoryName(initialValues);
  if (!categoryName) {
    return "";
  }

  const normalizedCategoryName = normalizeCategoryLabel(categoryName);
  const option = categoryOptions.find(
    (categoryOption) =>
      String(categoryOption.value) === String(categoryName) ||
      normalizeCategoryLabel(categoryOption.label) === normalizedCategoryName
  );

  return option ? String(option.value) : "";
}

function normalizeSelectOptions(options) {
  return options
      .map((option) => ({
        label:
            option?.label ||
            option?.name ||
            "",

        value: String(
            option?.value ??
            option?.id ??
            ""
        ),
      }))
      .filter((option) => option.value !== "");
}

function formatSelectLabel(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resolveInitialIdealFor(initialValues) {
  const value = initialValues?.ideal_for ?? initialValues?.idealFor;

  if (value === undefined || value === null || value === "") {
    return "";
  }

  const stringValue = String(value);
  const normalizedValue = normalizeCategoryLabel(stringValue);
  const option = idealForOptions.find(
    (idealForOption) =>
      idealForOption.value === stringValue ||
      normalizeCategoryLabel(idealForOption.value) === normalizedValue ||
      normalizeCategoryLabel(idealForOption.label) === normalizedValue
  );

  return option ? option.value : stringValue;
}

function resolveInitialSizeId(size, sizeOptions) {
  const sizeId =
    size?.size_id ??
    size?.sizeId ??
    size?.size?.id ??
    size?.size?._id ??
    "";

  if (sizeId !== undefined && sizeId !== null && sizeId !== "") {
    return String(sizeId);
  }

  const sizeName = size?.size_text ?? size?.size?.name ?? size?.name ?? "";
  const normalizedSizeName = normalizeCategoryLabel(sizeName);
  const option = sizeOptions.find(
    (sizeOption) => normalizeCategoryLabel(sizeOption.label) === normalizedSizeName
  );

  return option ? String(option.value) : "";
}

export function ProductForm({
  mode = "create",
  onSubmit,
  onCancel,
  loading,
  initialValues,
  categoryOptions = [],
  sizeOptions = [],
}) {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
  });
  const watchedCategoryId = useWatch({ control: form.control, name: "category_id" });
  const watchedIdealFor = useWatch({ control: form.control, name: "ideal_for" });
  const watchedIsActive = useWatch({ control: form.control, name: "is_active" });
  const watchedIsCollection = useWatch({ control: form.control, name: "is_collection" });
  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedSizes = useWatch({ control: form.control, name: "sizes" });
  const currentSlug = useWatch({ control: form.control, name: "slug" });

  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideo, setPreviewVideo] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const selectedCategoryId = String(watchedCategoryId || "");
  const selectedIdealFor = String(watchedIdealFor || "");
  const isActive = Boolean(watchedIsActive);
  const isCollection = Boolean(watchedIsCollection);
  const normalizedCategoryOptions = useMemo(
    () => normalizeSelectOptions(categoryOptions),
    [categoryOptions]
  );
  const normalizedSizeOptions = useMemo(
    () => normalizeSelectOptions(sizeOptions),
    [sizeOptions]
  );
  const categorySelectOptions = useMemo(() => {
    if (
      !selectedCategoryId ||
      normalizedCategoryOptions.some((option) => option.value === selectedCategoryId)
    ) {
      return normalizedCategoryOptions;
    }

    const categoryName = resolveInitialCategoryName(initialValues);
    return categoryName
      ? [{ label: categoryName, value: selectedCategoryId }, ...normalizedCategoryOptions]
      : normalizedCategoryOptions;
  }, [initialValues, normalizedCategoryOptions, selectedCategoryId]);
  const idealForSelectOptions = useMemo(() => {
    if (
      !selectedIdealFor ||
      idealForOptions.some((option) => option.value === selectedIdealFor)
    ) {
      return idealForOptions;
    }

    return [
      { label: formatSelectLabel(selectedIdealFor), value: selectedIdealFor },
      ...idealForOptions,
    ];
  }, [selectedIdealFor]);

  const getSizeSelectOptions = (selectedSize) => {
    if (
      !selectedSize ||
      normalizedSizeOptions.some((option) => option.value === selectedSize)
    ) {
      return normalizedSizeOptions;
    }

    return [
      { label: selectedSize, value: selectedSize },
      ...normalizedSizeOptions,
    ];
  };

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  useEffect(() => {
    if (!initialValues) return;

    const categoryId = String(
        initialValues?.category_id ||
        initialValues?.category?.id ||
        ""
    );

    const idealFor = String(
        initialValues?.ideal_for ||
        ""
    );

    form.reset({
      name: initialValues.name || "",
      slug: initialValues.slug || "",
      description: initialValues.description || "",
      short_description: initialValues.short_description || "",
      category_id: categoryId,
      discount_percentage: initialValues.discount_percentage ?? 0,
      weight_grams: initialValues.weight_grams ?? "",
      brand: initialValues.brand || "",
      base_material: initialValues.base_material || "",
      plating: initialValues.plating || "",
      gemstone: initialValues.gemstone || "",
      design: initialValues.design || "",
      occasion: initialValues.occasion || "",
      ideal_for: idealFor,
      package_contents: initialValues.package_contents || "",
      is_active: Boolean(initialValues.is_active),
      is_collection: Boolean(initialValues.is_collection ?? initialValues.add_collection),
      images: initialValues.images || initialValues.image || [],
      video: initialValues.video || initialValues.video_url || "",
      sizes:
          initialValues.sizes?.length > 0
            ? initialValues.sizes.map((size) => ({
                size_id: resolveInitialSizeId(size, normalizedSizeOptions),
                quantity: size.quantity ?? "",
                price: size.price ?? "",
              }))
            : [{ size_id: "", quantity: "", price: "" }],
    });

    setTimeout(() => {
      form.setValue("category_id", categoryId);
      form.setValue("ideal_for", idealFor);
    }, 0);

    const previewImages = (
        initialValues.images ||
        initialValues.image ||
        []
    )
        .map(normalizePreviewImage)
        .filter(Boolean);

    const previewTimer = setTimeout(() => {
      setPreviewImages(previewImages);
      setPreviewVideo(initialValues.video || initialValues.video_url || "");
    }, 0);

    return () => clearTimeout(previewTimer);
  }, [initialValues, form, normalizedSizeOptions]);


  useEffect(() => {
    if (!initialValues || form.getValues("category_id") || !normalizedCategoryOptions.length) {
      return;
    }

    const categoryId = resolveCategoryIdFromOptions(initialValues, normalizedCategoryOptions);
    if (categoryId) {
      form.setValue("category_id", categoryId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [normalizedCategoryOptions, initialValues, form]);

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

  const handleMediaUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type?.startsWith("image/"));
    const videoFiles = files.filter((file) => file.type?.startsWith("video/"));
    const unsupportedFiles = files.filter(
      (file) => !file.type?.startsWith("image/") && !file.type?.startsWith("video/")
    );

    if (unsupportedFiles.length) {
      toast.error("Only image and video files are allowed.");
      return;
    }

    if (videoFiles.length > MAX_VIDEOS) {
      toast.error(`Only ${MAX_VIDEOS} video is allowed per product.`);
      return;
    }

    if (videoFiles.length && previewVideo) {
      toast.error(`Maximum ${MAX_VIDEOS} video allowed per product.`);
      return;
    }

    if (imageFiles.length && previewImages.length + imageFiles.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed per product.`);
      return;
    }

    const currentMediaCount = previewImages.length + (previewVideo ? 1 : 0);
    const incomingMediaCount = imageFiles.length + videoFiles.length;
    if (currentMediaCount + incomingMediaCount > MAX_MEDIA) {
      toast.error(`Maximum ${MAX_MEDIA} media files allowed (${MAX_IMAGES} images and ${MAX_VIDEOS} video).`);
      return;
    }

    const oversizedImage = imageFiles.find((file) => file.size > 2 * 1024 * 1024);
    if (oversizedImage) {
      toast.error(`${oversizedImage.name} exceeds the 2 MB image size limit.`);
      return;
    }

    const oversizedVideo = videoFiles.find((file) => file.size > MAX_VIDEO_SIZE);
    if (oversizedVideo) {
      toast.error(`${oversizedVideo.name} exceeds the 10 MB video size limit.`);
      return;
    }

    const isUploading = imageFiles.length > 0 || videoFiles.length > 0;
    if (!isUploading) return;

    if (imageFiles.length) setIsUploadingImages(true);
    if (videoFiles.length) setIsUploadingVideo(true);

    try {
      if (imageFiles.length) {
        const uploadedImages = await Promise.all(
          imageFiles.map(async (file) => {
            const url = await uploadMediaFile(file, "products");

            return {
              url,
              preview: url,
              name: file.name,
              isExisting: false,
            };
          })
        );

        setPreviewImages((prev) => [...prev, ...uploadedImages]);
        form.setValue("images", [...(form.getValues("images") || []), ...uploadedImages], {
          shouldValidate: true,
          shouldDirty: true,
        });
      }

      if (videoFiles.length) {
        const videoUrl = await uploadMediaFile(videoFiles[0], "products");
        setPreviewVideo(videoUrl);
        form.setValue("video", videoUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Media upload failed");
    } finally {
      setIsUploadingImages(false);
      setIsUploadingVideo(false);
    }
  };

  const removeImage = (index) => {
    const removed = previewImages[index];
    if (removed?.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(removed.preview);
    }

    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    form.setValue(
      "images",
      (form.getValues("images") || []).filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const imageCount = previewImages.length;
  const hasVideo = Boolean(previewVideo);
  const isUploadingMedia = isUploadingImages || isUploadingVideo;
  const mediaCount = imageCount + (hasVideo ? 1 : 0);
  const maxMediaReached = mediaCount >= MAX_MEDIA;

  const removeVideo = () => {
    setPreviewVideo("");
    form.setValue("video", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const submitHandler = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const renderFieldError = (fieldName) =>
    form.formState.errors[fieldName] ? (
      <p className="text-xs text-destructive">{form.formState.errors[fieldName].message}</p>
    ) : null;

  const renderTextInput = ({ name, label, placeholder, type = "text", ...inputProps }) => (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm">
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        className={compactInputClass}
        {...inputProps}
        {...form.register(name)}
      />
      {renderFieldError(name)}
    </div>
  );

  const renderSwitchField = (name, label, checked) => (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <Label htmlFor={name}>{label}</Label>
      <Switch
        id={name}
        checked={checked}
        onCheckedChange={(checked) =>
          form.setValue(name, checked, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
    </div>
  );

  const renderMediaUploadBox = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Product Images</Label>
        <span className="text-xs text-muted-foreground">
          {imageCount}/{MAX_IMAGES} images · {hasVideo ? 1 : 0}/{MAX_VIDEOS} video · {mediaCount}/{MAX_MEDIA} total
        </span>
      </div>
      <div
        className={`flex h-[220px] w-full rounded-lg border-2 border-dashed p-4 ${
          maxMediaReached ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-300"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          className="hidden"
          id="media-upload"
          disabled={maxMediaReached || isUploadingMedia}
        />
        <label
          htmlFor="media-upload"
          className={`flex h-full w-full flex-col items-center justify-center text-center ${
            maxMediaReached || isUploadingMedia ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isUploadingMedia ? (
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            {isUploadingMedia
              ? "Uploading media..."
              : maxMediaReached
                ? "Maximum media reached"
                : "Click to upload images or video"}
          </span>
          <span className="text-xs text-gray-500">
            Max {MAX_IMAGES} images (2MB each), {MAX_VIDEOS} video (10MB) — {MAX_MEDIA} total
          </span>
        </label>
      </div>
      {form.formState.errors.images && (
        <p className="text-sm text-destructive">{form.formState.errors.images.message}</p>
      )}
      {form.formState.errors.video && (
        <p className="text-sm text-destructive">{form.formState.errors.video.message}</p>
      )}
    </div>
  );

  const renderMediaPreviews = () =>
    previewImages.length > 0 || hasVideo ? (
      <div className="mt-4 flex w-full flex-row gap-2">
        {previewImages.map((image, index) => (
          <div key={`${image.name}-${index}`} className="group relative shrink-0">
            <img
              src={image.preview || image}
              alt={image.name || `Product image ${index + 1}`}
              className={MEDIA_PREVIEW_CLASS}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {hasVideo ? (
          <div className="group relative shrink-0">
            <video
              key={previewVideo}
              src={previewVideo}
              className={MEDIA_PREVIEW_CLASS}
              muted
              playsInline
              preload="metadata"
            />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <form onSubmit={submitHandler} className="space-y-4 pb-24">
      <div className="rounded-lg border border-border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
          <div className="space-y-4">
            {renderMediaUploadBox()}
          </div>

          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="w-full sm:w-[220px]">
                {renderSwitchField("is_active", "Active Product", isActive)}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderTextInput({
                name: "name",
                label: "Product Name",
                placeholder: "Enter product name",
              })}
              {renderTextInput({
                name: "slug",
                label: "Slug",
                placeholder: "Enter slug",
              })}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={3}
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {renderMediaPreviews()}
      </div>

      <div className="rounded-lg border border-border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-sm">Category</Label>
            <Select
                key={selectedCategoryId}
                value={selectedCategoryId}
                onValueChange={(value) => {
                  form.setValue("category_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
            >
              <SelectTrigger className={compactSelectClass}>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>

              <SelectContent
                align="start"
                avoidCollisions={false}
                className="w-[var(--radix-select-trigger-width)]"
                position="popper"
                side="bottom"
                sideOffset={4}
              >
                {categorySelectOptions.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={String(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category_id && (
              <p className="text-xs text-destructive">{form.formState.errors.category_id.message}</p>
            )}
          </div>

          <div className="lg:col-span-2">
            {renderTextInput({
              name: "discount_percentage",
              label: "Discount Percentage",
              placeholder: "0",
              type: "number",
              min: "0",
              max: "100",
            })}
          </div>

          <div className="lg:col-span-2">
            {renderTextInput({
              name: "weight_grams",
              label: "Weight (grams)",
              placeholder: "Enter weight in grams",
              type: "number",
              min: "0",
              step: "0.01",
            })}
          </div>

          {renderSwitchField("is_collection", "Add Collection", isCollection)}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-white border-border p-4">
        <div className="flex items-center justify-between">
          <Label>Product Sizes</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSize({ size_id: "", quantity: "", price: "" })}
            className="border-border bg-white text-foreground hover:bg-white"
          >
            <Plus className="mr-1 size-4" />
            Add
          </Button>
        </div>

        {sizeFields.length > 0 ? (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizeFields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Select
                        value={String(watchedSizes?.[index]?.size_id || "")}
                        onValueChange={(value) => {
                          form.setValue(`sizes.${index}.size_id`, value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      >
                        <SelectTrigger className={compactSelectClass}>
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent
                          align="start"
                          avoidCollisions={false}
                          className="w-[var(--radix-select-trigger-width)]"
                          position="popper"
                          side="bottom"
                          sideOffset={4}
                        >
                          {getSizeSelectOptions(String(watchedSizes?.[index]?.size_id || "")).map(
                            (option) => (
                              <SelectItem key={option.value} value={String(option.value)}>
                                {option.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className={compactInputClass}
                        {...form.register(`sizes.${index}.quantity`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={compactInputClass}
                        {...form.register(`sizes.${index}.price`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSize(index)}
                        aria-label="Remove size row"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No sizes added yet. Click Add to create size variants.
          </p>
        )}
        {form.formState.errors.sizes && (
          <p className="text-sm text-destructive">
            {typeof form.formState.errors.sizes.message === "string"
              ? form.formState.errors.sizes.message
              : "Please check size rows for errors."}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Product Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {productDetailFields.map((field) => (
            <div key={field.name}>{renderTextInput(field)}</div>
          ))}

          <div className="space-y-1.5">
            <Label className="text-sm">Ideal For</Label>
            <Select
                key={selectedIdealFor}
                value={selectedIdealFor}
                onValueChange={(value) => {
                  form.setValue("ideal_for", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
            >
              <SelectTrigger className={compactSelectClass}>
                <SelectValue placeholder="Select Ideal For" />
              </SelectTrigger>

              <SelectContent
                align="start"
                avoidCollisions={false}
                className="w-[var(--radix-select-trigger-width)]"
                position="popper"
                side="bottom"
                sideOffset={4}
              >
                {idealForOptions.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderFieldError("ideal_for")}
          </div>

          {renderTextInput({
            name: "package_contents",
            label: "Package Contents",
            placeholder: "e.g. 1 Necklace, 1 Pair Earrings",
          })}
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
          disabled={loading || isUploadingMedia}
          className="bg-green-600 text-white hover:bg-green-600/90"
        >
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}
