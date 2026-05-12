"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Upload, X } from "lucide-react";
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
      });
      
      if (initialValues.images && initialValues.images.length > 0) {
        setPreviewImages(initialValues.images);
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

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setPreviewImages(prev => [...prev, ...newImages]);
    form.setValue("images", [...(form.getValues("images") || []), ...validFiles]);
  };

  const removeImage = (index) => {
    const newImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newImages);
    
    const currentFiles = form.getValues("images") || [];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue("images", newFiles);
  };

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
        <Label>Product Images</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Click to upload images</span>
            <span className="text-xs text-gray-500">Max 5 files, 2MB each</span>
          </label>
        </div>

        {previewImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
            {previewImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.preview || image}
                  alt={image.name || `Product image ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
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
