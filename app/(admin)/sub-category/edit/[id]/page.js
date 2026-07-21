"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryForm } from "@/components/category/category-form";
import {
  buildCategoryPayload,
  normalizeCategory,
} from "@/components/category/category-utils";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/admin/module/use-categories";
import { useCategory } from "@/hooks/admin/module/use-category";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { ADMIN_API_ROUTES } from "@/lib/routes";

export default function EditSubCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const categoryId = String(params.id ?? "");
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useCategory(categoryId);
  const { data: categoriesData } = useCategories(1, 10, "", "all", "main");

  const categories = useMemo(
    () => (categoriesData?.data || categoriesData?.results || []).map(normalizeCategory),
    [categoriesData]
  );

  const { create: saveCategory } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.UPDATE_CATEGORIES,
    onSuccess: async (res) => {
      toast.success(res?.message || "Subcategory updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
      router.push("/sub-category");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Update failed"),
  });

  useEffect(() => {
    if (!isError) return;
    toast.error("Failed to fetch subcategory details");
    router.push("/sub-category");
  }, [isError, router]);

  useEffect(() => {
    if (!data) return;
    if (!data.parent_id) {
      toast.error("This record is a main category. Opening the Main Category module.");
      router.replace(`/category/edit/${categoryId}`);
    }
  }, [data, categoryId, router]);

  const handleSubmit = async (payload) => {
    const parentId = payload?.parent_id;

    if (!parentId || parentId === "none" || parentId === "null") {
      toast.error("Please select a main category");
      return;
    }

    setLoading(true);
    try {
      const categoryPayload = await buildCategoryPayload(
        { ...payload, parent_id: parentId, type: "sub" },
        {
          editValue: categoryId,
          categoryId,
        }
      );
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
          onClick={() => router.push("/sub-category")}
          className="border-border bg-white text-foreground hover:bg-white"
          aria-label="Back to subcategories"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit Sub Category</h2>
          <p className="text-sm text-muted-foreground">
            Update subcategory details and parent assignment.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-white p-6">
        {isLoading || !data?.parent_id ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <CategoryForm
            mode="edit"
            variant="sub"
            loading={loading}
            initialValues={data}
            categories={categories}
            onCancel={() => router.push("/sub-category")}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </section>
  );
}
