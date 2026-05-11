"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryForm } from "@/components/category/category-form";
import { normalizeCategory } from "@/components/category/category-utils";
import { Button } from "@/components/ui/button";
import { useCrudMutation } from "@/hooks/admin/module/use-crud-mutation";
import { useCategories } from "@/hooks/admin/module/use-categories";
import { ADMIN_API_ROUTES } from "@/lib/routes";

export default function CreateCategoryPage() {
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
    baseUrl: ADMIN_API_ROUTES.CREATE_CATEGORIES,
    onSuccess: async (res) => {
      toast.success(res?.message || "Category created successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/category");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Create failed"),
  });

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      await create({
        ...payload,
        edit_value: 0,
      });
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
          <h2 className="text-2xl font-semibold tracking-tight">Create Category</h2>
          <p className="text-sm text-muted-foreground">Add a new category to your catalog.</p>
        </div>
      </div>

      <div className="rounded-md border border-border p-6">
        <CategoryForm
          mode="create"
          loading={loading}
          categoryOptions={categoryOptions}
          onCancel={() => router.push("/category")}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}
