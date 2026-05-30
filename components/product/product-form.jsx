"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
  brand: "",
  base_material: "",
  plating: "",
  gemstone: "",
  design: "",
  occasion: "",
  ideal_for: "",
  package_contents: "",
  is_active: true,
  track_stock: false,
  images: [],
  sizes: [],
};

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

export function ProductForm({
  mode = "create",
  onSubmit,
  onCancel,
  loading,
  initialValues,
  categoryOptions = [],
}) {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const selectedCategoryId = String(form.watch("category_id") || "");
  const selectedIdealFor = String(form.watch("ideal_for") || "");
  const normalizedCategoryOptions = useMemo(
    () => normalizeSelectOptions(categoryOptions),
    [categoryOptions]
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
      brand: initialValues.brand || "",
      base_material: initialValues.base_material || "",
      plating: initialValues.plating || "",
      gemstone: initialValues.gemstone || "",
      design: initialValues.design || "",
      occasion: initialValues.occasion || "",
      ideal_for: idealFor,
      package_contents: initialValues.package_contents || "",
      is_active: Boolean(initialValues.is_active),
      track_stock: Boolean(initialValues.track_stock),
      images: initialValues.images || initialValues.image || [],
      sizes:
          initialValues.sizes?.map((size) => ({
            size_text: size.size_text ?? "",
            quantity: size.quantity ?? "",
            price: size.price ?? "",
          })) || [],
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

    setPreviewImages(previewImages);

  }, [initialValues]);


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
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024); // 2MB limit
    
    if (validFiles.length !== files.length) {
      alert("Some files exceed the 2MB limit and were not added.");
    }

    if (previewImages.length + validFiles.length > 5) {
      alert("Maximum 5 images allowed.");
      event.target.value = "";
      return;
    }

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    setIsUploadingImages(true);
    try {
      const uploadedImages = await Promise.all(
        validFiles.map(async (file) => {
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
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Image upload failed");
    } finally {
      setIsUploadingImages(false);
      event.target.value = "";
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
  const maxImagesReached = imageCount >= 5;

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

  return (
    <form onSubmit={submitHandler} className="space-y-6">
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

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter product description"
          rows={4}
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="short_description">Short Description</Label>
        <Textarea
          id="short_description"
          placeholder="Enter short description"
          rows={2}
          {...form.register("short_description")}
        />
        {form.formState.errors.short_description && (
          <p className="text-xs text-destructive">{form.formState.errors.short_description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
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

            <SelectContent>
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

        {renderTextInput({
          name: "discount_percentage",
          label: "Discount Percentage",
          placeholder: "0",
          type: "number",
          min: "0",
          max: "100",
        })}
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4">
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

              <SelectContent>
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
          <Label htmlFor="track_stock">Track Stock</Label>
          <Switch
            id="track_stock"
            checked={form.watch("track_stock")}
            onCheckedChange={(checked) =>
              form.setValue("track_stock", checked, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
          <Label htmlFor="is_active">Active Product</Label>
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
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Product Images</Label>
          <span className="text-xs text-muted-foreground">{imageCount}/5 uploaded</span>
        </div>
        <div
          className={`rounded-lg border-2 border-dashed p-4 ${
            maxImagesReached ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-300"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={maxImagesReached || isUploadingImages}
          />
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center ${
              maxImagesReached || isUploadingImages ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isUploadingImages ? (
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
            ) : (
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {isUploadingImages
                ? "Uploading images..."
                : maxImagesReached
                  ? "Maximum images reached"
                  : "Click to upload images"}
            </span>
            <span className="text-xs text-gray-500">Max 5 files, 2MB each</span>
          </label>
        </div>

        {previewImages.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            {previewImages.map((image, index) => (
              <div key={`${image.name}-${index}`} className="group relative">
                <img
                  src={image.preview || image}
                  alt={image.name || `Product image ${index + 1}`}
                  className="h-20 w-full rounded border object-cover"
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
          </div>
        )}
        {form.formState.errors.images && (
          <p className="text-sm text-destructive">{form.formState.errors.images.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Product Sizes</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSize({ size_text: "", quantity: "", price: "" })}
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
                      <Input
                        placeholder="e.g. S"
                        className={compactInputClass}
                        {...form.register(`sizes.${index}.size_text`)}
                      />
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

      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        Slug is auto-generated from name for new products, and can be edited manually.
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
          disabled={loading || isUploadingImages}
          className="bg-green-600 text-white hover:bg-green-600/90"
        >
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}
