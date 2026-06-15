"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryForm } from "@/components/category/category-form";
import { buildCategoryPayload } from "@/components/category/category-utils";
import { Button } from "@/components/ui/button";
import { useCategory } from "@/hooks/admin/module/use-category";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { ADMIN_API_ROUTES } from "@/lib/routes";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const categoryId = String(params.id ?? "");
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useCategory(categoryId);

  const { create: saveCategory } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.UPDATE_CATEGORIES,
    onSuccess: async (res) => {
      toast.success(res?.message || "Category updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
      router.push("/category");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Update failed"),
  });

  useEffect(() => {
    if (!isError) return;
    toast.error("Failed to fetch category details");
    router.push("/category");
  }, [isError, router]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const categoryPayload = await buildCategoryPayload(payload, {
        editValue: categoryId,
        categoryId,
      });
      await saveCategory(categoryPayload);
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
          onClick={() => router.push("/category")}
          className="border-border bg-white text-foreground hover:bg-white"
          aria-label="Back to categories"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit Category</h2>
          <p className="text-sm text-muted-foreground">
            Update category details and keep your catalog organized.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border p-6">
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <CategoryForm
            mode="edit"
            loading={loading}
            initialValues={data}
            onCancel={() => router.push("/category")}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </section>
  );
}
