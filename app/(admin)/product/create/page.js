"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProductForm } from "@/components/product/product-form";
import { buildProductPayload } from "@/components/product/product-utils";
import { normalizeCategory } from "@/components/category/category-utils";
import { Button } from "@/components/ui/button";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { useCategories } from "@/hooks/admin/module/use-categories";
import { ADMIN_API_ROUTES } from "@/lib/routes";

export default function CreateProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { data } = useCategories(1, 100, "", "all");

  const categories = useMemo(
    () => (data?.data || data?.results || []).map(normalizeCategory),
    [data]
  );
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
    [categories]
  );

  const { create } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.CREATE_PRODUCTS,
    onSuccess: async (res) => {
      toast.success(res?.message || "Product created successfully");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/product");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Create failed"),
  });

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const productPayload = buildProductPayload(payload, { editValue: 0 });
      await create(productPayload);
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
          <h2 className="text-2xl font-semibold tracking-tight">Create Product</h2>
          <p className="text-sm text-muted-foreground">Add a new product to your catalog.</p>
        </div>
      </div>

      <div className="rounded-md border border-border p-6">
        <ProductForm
          mode="create"
          loading={loading}
          categoryOptions={categoryOptions}
          onCancel={() => router.push("/product")}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}
