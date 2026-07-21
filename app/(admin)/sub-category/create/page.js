"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryForm } from "@/components/category/category-form";
import {
  buildCategoryPayload,
  normalizeCategory,
} from "@/components/category/category-utils";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/admin/module/use-categories";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { ADMIN_API_ROUTES } from "@/lib/routes";

export default function CreateSubCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { data } = useCategories(1, 10, "", "all", "main");

  const categories = useMemo(
    () => (data?.data || data?.results || []).map(normalizeCategory),
    [data]
  );

  const { create } = useCrudMutation({
    baseUrl: ADMIN_API_ROUTES.CREATE_CATEGORIES,
    onSuccess: async (res) => {
      toast.success(res?.message || "Subcategory created successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/sub-category");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Create failed"),
  });

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
        { editValue: 0 }
      );
      await create(categoryPayload);
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
          <h2 className="text-2xl font-semibold tracking-tight">Create Sub Category</h2>
          <p className="text-sm text-muted-foreground">
            Add a subcategory under an existing main category.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-white p-6">
        <CategoryForm
          mode="create"
          variant="sub"
          loading={loading}
          categories={categories}
          onCancel={() => router.push("/sub-category")}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}
