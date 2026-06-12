"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, RotateCw, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buildBannerSlots, normalizeBanner } from "@/components/banner/banner-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBanners } from "@/hooks/admin/module/use-banners";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { uploadMediaFile } from "@/services/media-service";
import { customAxios } from "@/utils/api";

function BannerSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-border/70">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="aspect-[16/7] w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function BannerManager() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isFetching, refetch } = useBanners();
  const [slotOverrides, setSlotOverrides] = useState({});
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);

  const slots = useMemo(
    () =>
      buildBannerSlots(data).map((slot, index) => ({
        ...slot,
        ...slotOverrides[index],
      })),
    [data, slotOverrides]
  );

  const handleBannerUpload = async (event, slotIndex) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    setUploadingSlot(slotIndex);
    try {
      const imageUrl = await uploadMediaFile(file, "banners");
      const currentSlot = slots[slotIndex];
      const payload = {
        edit_value: currentSlot?.id || 0,
        image: imageUrl,
        sort_order: slotIndex + 1,
      };

      const { data: savedBannerResponse } = await customAxios.post(
        ADMIN_API_ROUTES.CREATE_BANNERS,
        payload
      );

      const savedBanner = normalizeBanner(
        savedBannerResponse?.data || savedBannerResponse?.result || savedBannerResponse,
        slotIndex + 1
      );

      setSlotOverrides((currentOverrides) => ({
        ...currentOverrides,
        [slotIndex]: {
          id: savedBanner.id || currentSlot?.id || null,
          image: savedBanner.image || imageUrl,
          sort_order: slotIndex + 1,
        },
      }));
      await queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success(`Banner ${slotIndex + 1} saved successfully`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Banner upload failed");
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemoveBanner = async (slotIndex) => {
    const currentSlot = slots[slotIndex];

    if (!currentSlot?.id) {
      setSlotOverrides((currentOverrides) => ({
        ...currentOverrides,
        [slotIndex]: { id: null, image: "", sort_order: slotIndex + 1 },
      }));
      return;
    }

    setDeletingSlot(slotIndex);
    try {
      await customAxios.delete(`${ADMIN_API_ROUTES.DELETE_BANNERS}/${currentSlot.id}`);
      setSlotOverrides((currentOverrides) => ({
        ...currentOverrides,
        [slotIndex]: { id: null, image: "", sort_order: slotIndex + 1 },
      }));
      await queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success(`Banner ${slotIndex + 1} removed successfully`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Remove failed");
    } finally {
      setDeletingSlot(null);
    }
  };

  if (isLoading) {
    return <BannerSkeletonGrid />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border-border bg-white text-foreground hover:bg-white"
        >
          {isFetching ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RotateCw className="mr-2 size-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {slots.map((slot, index) => {
          const inputId = `banner-image-${index + 1}`;
          const isUploading = uploadingSlot === index;
          const isDeleting = deletingSlot === index;
          const isBusy = isUploading || isDeleting;

          return (
            <Card key={slot.sort_order} className="border-border/70">
              <CardHeader>
                <CardTitle>Banner {index + 1}</CardTitle>
                <CardDescription>Sort order {index + 1}</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  id={inputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isBusy}
                  onChange={(event) => handleBannerUpload(event, index)}
                />
                <label
                  htmlFor={inputId}
                  className={`group relative flex aspect-[16/7] min-h-36 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 transition-colors sm:min-h-44 ${
                    isBusy
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer hover:border-primary/60 hover:bg-muted/50"
                  }`}
                  aria-label={`Upload banner ${index + 1}`}
                >
                  {slot.image ? (
                    <Image
                      src={slot.image}
                      alt={`Banner ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-14 items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm ring-1 ring-border transition-colors group-hover:text-primary">
                      {isUploading ? (
                        <Loader2 className="size-7 animate-spin" />
                      ) : (
                        <Plus className="size-7" />
                      )}
                    </span>
                  )}

                  {slot.image ? (
                    <span className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md ring-1 ring-border transition-colors group-hover:text-primary">
                      {isUploading ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Plus className="size-5" />
                      )}
                    </span>
                  ) : null}

                  {isUploading && slot.image ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <Loader2 className="size-7 animate-spin text-white" />
                    </span>
                  ) : null}
                </label>

                {slot.image ? (
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveBanner(index)}
                      disabled={isBusy}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 size-4" />
                      )}
                      Remove
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
