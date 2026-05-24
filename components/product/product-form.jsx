"use client";

import { useEffect, useState } from "react";
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

const defaultValues = {
  name: "",
  slug: "",
  description: "",
  short_description: "",
  price: "",
  sale_price: "",
  cost_price: "",
  category_id: "",
  is_active: true,
  stock_quantity: 0,
  track_stock: false,
  images: [],
  sizes: [],
};

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

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name || "",
        slug: initialValues.slug || "",
        description: initialValues.description || "",
        short_description: initialValues.short_description || "",
        price: initialValues.price || "",
        sale_price: initialValues.sale_price || "",
        cost_price: initialValues.cost_price || "",
        category_id: initialValues.category_id || "",
        is_active: Boolean(initialValues.is_active),
        stock_quantity: initialValues.stock_quantity || 0,
        track_stock: Boolean(initialValues.track_stock),
        images: initialValues.images || [],
        sizes: initialValues.sizes?.length
          ? initialValues.sizes.map((size) => ({
              size_text: size.size_text ?? "",
              quantity: size.quantity ?? "",
              price: size.price ?? "",
            }))
          : [],
      });

      if (initialValues.images?.length) {
        setPreviewImages(
          initialValues.images.map((image) =>
            typeof image === "string"
              ? { preview: image, name: `Image`, isExisting: true }
              : image
          )
        );
      } else {
        setPreviewImages([]);
      }
      return;
    }
    form.reset(defaultValues);
    setPreviewImages([]);
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

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024); // 2MB limit
    
    if (validFiles.length !== files.length) {
      alert("Some files exceed the 2MB limit and were not added.");
    }

    if (previewImages.length + validFiles.length > 5) {
      alert("Maximum 5 images allowed.");
      return;
    }

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      isExisting: false,
    }));

    setPreviewImages((prev) => [...prev, ...newImages]);
    form.setValue("images", [...(form.getValues("images") || []), ...validFiles], {
      shouldValidate: true,
      shouldDirty: true,
    });
    event.target.value = "";
  };

  const removeImage = (index) => {
    const removed = previewImages[index];
    if (removed?.preview && !removed?.isExisting) {
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

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" placeholder="Enter product name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" placeholder="Enter slug" {...form.register("slug")} />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter product description"
          rows={4}
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="short_description">Short Description</Label>
        <Textarea
          id="short_description"
          placeholder="Enter short description"
          rows={2}
          {...form.register("short_description")}
        />
        {form.formState.errors.short_description && (
          <p className="text-sm text-destructive">{form.formState.errors.short_description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Regular Price</Label>
          <Input id="price" type="number" step="0.01" min="0" placeholder="0.00" {...form.register("price")} />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale_price">Sale Price</Label>
          <Input id="sale_price" type="number" step="0.01" min="0" placeholder="0.00" {...form.register("sale_price")} />
          {form.formState.errors.sale_price && (
            <p className="text-sm text-destructive">{form.formState.errors.sale_price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_price">Cost Price</Label>
          <Input id="cost_price" type="number" step="0.01" min="0" placeholder="0.00" {...form.register("cost_price")} />
          {form.formState.errors.cost_price && (
            <p className="text-sm text-destructive">{form.formState.errors.cost_price.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.watch("category_id") || "none"}
            onValueChange={(value) =>
              form.setValue("category_id", value === "none" ? "" : value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Category</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category_id && (
            <p className="text-sm text-destructive">{form.formState.errors.category_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Stock Quantity</Label>
          <Input id="stock_quantity" type="number" min="0" {...form.register("stock_quantity")} />
          {form.formState.errors.stock_quantity && (
            <p className="text-sm text-destructive">{form.formState.errors.stock_quantity.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
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

      <div className="flex items-center justify-between gap-4">
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
            disabled={maxImagesReached}
          />
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center ${
              maxImagesReached ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {maxImagesReached ? "Maximum images reached" : "Click to upload images"}
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
                        {...form.register(`sizes.${index}.size_text`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...form.register(`sizes.${index}.quantity`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
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
          disabled={loading}
          className="bg-green-600 text-white hover:bg-green-600/90"
        >
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}
