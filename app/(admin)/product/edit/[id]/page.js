"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProductForm } from "@/components/product/product-form";
import { buildProductPayload } from "@/components/product/product-utils";
import { normalizeCategory } from "@/components/category/category-utils";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/admin/module/use-product";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { useCategories } from "@/hooks/admin/module/use-categories";
import { useSizeOptions } from "@/hooks/admin/module/use-sizes";
import { ADMIN_API_ROUTES } from "@/lib/routes";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const productId = String(params.id ?? "");
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useProduct(productId);
  const { data: categoriesData } = useCategories(1, 100, "", "all");
  const { data: sizes = [] } = useSizeOptions();

  const categories = useMemo(
    () => (categoriesData?.data || categoriesData?.results || []).map(normalizeCategory),
    [categoriesData]
  );
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
    [categories]
  );
  const sizeOptions = useMemo(
    () =>
      sizes.map((size) => ({
        label: size.name,
        value: String(size.id),
      })),
    [sizes]
  );

  const { create: saveProduct } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.UPDATE_PRODUCTS,
    onSuccess: async (res) => {
      toast.success(res?.message || "Product updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      router.push("/product");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Update failed"),
  });

  useEffect(() => {
    if (!isError) return;
    toast.error("Failed to fetch product details");
    router.push("/product");
  }, [isError, router]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const productPayload = buildProductPayload(payload, {
        editValue: productId,
      });
      await saveProduct(productPayload);
    } catch (_) {
      // Error toast is handled in the mutation hook callbacks.
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => router.push("/product")}
          className="border-border bg-white text-foreground hover:bg-white"
          aria-label="Back to products"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit Product</h2>
          <p className="text-sm text-muted-foreground">
            Update product details and keep your catalog organized.
          </p>
        </div>
      </div>

      <div className="pb-8">
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <ProductForm
            mode="edit"
            loading={loading}
            initialValues={data}
            categoryOptions={categoryOptions}
            sizeOptions={sizeOptions}
            onCancel={() => router.push("/product")}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </section>
  );
}
