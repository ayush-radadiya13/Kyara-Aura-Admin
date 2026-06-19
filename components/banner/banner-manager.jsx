"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, RotateCw, Save, Trash2, Video } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BANNER_SLOT_COUNT,
  buildBannerFormState,
  buildBannerPayload,
  MAX_BANNER_VIDEO_SIZE,
  normalizeBanner,
} from "@/components/banner/banner-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useBanners } from "@/hooks/admin/module/use-banners";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { uploadMediaFile } from "@/services/media-service";
import { customAxios } from "@/utils/api";

const emptyFormState = {
  imageSlots: Array.from({ length: BANNER_SLOT_COUNT }, (_, index) => ({
    id: null,
    image: "",
    sort_order: index + 1,
  })),
  banner_title: "",
  banner_description: "",
  video: "",
  video_title: "",
  video_description: "",
};

const bannerUploadBoxClass =
  "group relative flex aspect-[16/7] min-h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 transition-colors";

const videoUploadBoxClass =
  "group relative flex aspect-[16/7] min-h-24 w-full max-w-xs items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 transition-colors";

function MediaUploadBox({
  inputId,
  accept,
  ariaLabel,
  boxClassName,
  disabled,
  isUploading,
  isBusy,
  onChange,
  preview,
  emptyIcon: EmptyIcon = Plus,
}) {
  return (
    <>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={onChange}
      />
      <label
        htmlFor={inputId}
        className={`${boxClassName} ${
          isBusy
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer hover:border-primary/60 hover:bg-muted/50"
        }`}
        aria-label={ariaLabel}
      >
        {preview}

        {preview ? (
          <span className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md ring-1 ring-border transition-colors group-hover:text-primary">
            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </span>
        ) : null}

        {isUploading && preview ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <Loader2 className="size-6 animate-spin text-white" />
          </span>
        ) : null}

        {!preview ? (
          <span className="flex size-12 items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm ring-1 ring-border transition-colors group-hover:text-primary">
            {isUploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <EmptyIcon className="size-6" />
            )}
          </span>
        ) : null}
      </label>
    </>
  );
}

function BannerSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[16/7] w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <Card className="border-border/70">
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="aspect-[16/7] max-w-xs rounded-lg" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function BannerManager() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isFetching, refetch } = useBanners();
  const [formState, setFormState] = useState(emptyFormState);
  const [uploadingImageSlot, setUploadingImageSlot] = useState(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingImageSlot, setRemovingImageSlot] = useState(null);
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);

  const serverFormState = useMemo(() => buildBannerFormState(data), [data]);

  useEffect(() => {
    setFormState(serverFormState);
  }, [serverFormState]);

  const updateField = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateImageSlot = (slotIndex, updates) => {
    setFormState((current) => ({
      ...current,
      imageSlots: current.imageSlots.map((slot, index) =>
        index === slotIndex ? { ...slot, ...updates } : slot
      ),
    }));
  };

  const buildSlotPayload = (slotIndex, overrides = {}) => {
    const imageSlot = formState.imageSlots[slotIndex];

    return {
      id: imageSlot?.id || null,
      image: imageSlot?.image || "",
      sort_order: slotIndex + 1,
      banner_title: formState.banner_title,
      banner_description: formState.banner_description,
      video: formState.video,
      video_title: formState.video_title,
      video_description: formState.video_description,
      ...overrides,
    };
  };

  const saveBannerSlot = async (slotIndex, overrides = {}, { includeVideo = false } = {}) => {
    const slot = buildSlotPayload(slotIndex, overrides);
    const payload = buildBannerPayload(slot, { includeVideo });

    const { data: savedBannerResponse } = await customAxios.post(
      ADMIN_API_ROUTES.CREATE_BANNERS,
      payload
    );

    const savedBanner = normalizeBanner(
      savedBannerResponse?.data || savedBannerResponse?.result || savedBannerResponse,
      slotIndex + 1
    );

    updateImageSlot(slotIndex, {
      id: savedBanner.id || slot.id || null,
      image: savedBanner.image || slot.image || "",
    });

    return savedBanner;
  };

  const handleBannerUpload = async (event, slotIndex) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    setUploadingImageSlot(slotIndex);
    try {
      const imageUrl = await uploadMediaFile(file, "banners");
      await saveBannerSlot(slotIndex, { image: imageUrl }, { includeVideo: slotIndex === 0 });
      await queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success(`Banner image ${slotIndex + 1} saved successfully`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Banner upload failed");
    } finally {
      setUploadingImageSlot(null);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type?.startsWith("video/")) {
      toast.error("Only video files are allowed.");
      return;
    }

    if (file.size > MAX_BANNER_VIDEO_SIZE) {
      toast.error("Video must be 30 MB or smaller.");
      return;
    }

    setIsUploadingVideo(true);
    try {
      const videoUrl = await uploadMediaFile(file, "banners");
      updateField("video", videoUrl);
      await saveBannerSlot(0, { video: videoUrl }, { includeVideo: true });
      await queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Video saved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Video upload failed");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await saveBannerSlot(0, {}, { includeVideo: true });

      for (let slotIndex = 1; slotIndex < BANNER_SLOT_COUNT; slotIndex += 1) {
        const imageSlot = formState.imageSlots[slotIndex];
        if (!imageSlot?.image && !imageSlot?.id) continue;

        await saveBannerSlot(slotIndex, {}, { includeVideo: false });
      }

      await queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner settings saved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = async (slotIndex) => {
    const imageSlot = formState.imageSlots[slotIndex];

    if (!imageSlot?.id) {
      updateImageSlot(slotIndex, { id: null, image: "" });
      return;
    }

    setRemovingImageSlot(slotIndex);
    try {
      await customAxios.delete(`${ADMIN_API_ROUTES.DELETE_BANNERS}/${imageSlot.id}`);
      updateImageSlot(slotIndex, { id: null, image: "" });
      await queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success(`Banner image ${slotIndex + 1} removed`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Remove failed");
    } finally {
      setRemovingImageSlot(null);
    }
  };

  const handleRemoveVideo = async () => {
    updateField("video", "");

    const primarySlot = formState.imageSlots[0];
    if (!primarySlot?.id && !formState.video) return;

    setIsRemovingVideo(true);
    try {
      if (primarySlot?.id) {
        await saveBannerSlot(0, { video: "" }, { includeVideo: true });
      }
      await queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Video removed");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Video remove failed");
    } finally {
      setIsRemovingVideo(false);
    }
  };

  const isBusy =
    isSaving ||
    isUploadingVideo ||
    isRemovingVideo ||
    uploadingImageSlot !== null ||
    removingImageSlot !== null;

  if (isLoading) {
    return <BannerSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching || isBusy}
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

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Banner Section</CardTitle>
          <CardDescription>Upload up to four banner images with shared title and description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label>Banner Images</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {formState.imageSlots.map((slot, index) => {
                const imageInputId = `banner-image-${index + 1}`;
                const isUploadingImage = uploadingImageSlot === index;
                const isRemovingImage = removingImageSlot === index;
                const slotBusy = isUploadingImage || isRemovingImage;

                return (
                  <div key={slot.sort_order} className="space-y-2">
                    <Label htmlFor={imageInputId} className="text-sm text-muted-foreground">
                      Banner Image {index + 1}
                    </Label>
                    <MediaUploadBox
                      inputId={imageInputId}
                      accept="image/*"
                      ariaLabel={`Upload banner image ${index + 1}`}
                      boxClassName={bannerUploadBoxClass}
                      disabled={isBusy}
                      isUploading={isUploadingImage}
                      isBusy={isBusy}
                      onChange={(event) => handleBannerUpload(event, index)}
                      preview={
                        slot.image ? (
                          <Image
                            src={slot.image}
                            alt={`Banner image ${index + 1}`}
                            fill
                            sizes="(min-width: 640px) 50vw, 100vw"
                            unoptimized
                            className="object-cover"
                          />
                        ) : null
                      }
                    />

                    {slot.image ? (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          disabled={isBusy}
                        >
                          {isRemovingImage ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 size-4" />
                          )}
                          Remove
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-title">Banner Title</Label>
            <Input
              id="banner-title"
              placeholder="Summer Collection"
              value={formState.banner_title}
              onChange={(event) => updateField("banner_title", event.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-description">Banner Description</Label>
            <Textarea
              id="banner-description"
              placeholder="Shop the latest styles"
              value={formState.banner_description}
              onChange={(event) => updateField("banner_description", event.target.value)}
              disabled={isBusy}
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Video Section</CardTitle>
          <CardDescription>Upload one banner video with title and description (max 30 MB).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="banner-video">Video</Label>
            <p className="text-sm text-muted-foreground">MP4, WebM, or other video formats up to 30 MB.</p>
            <MediaUploadBox
              inputId="banner-video"
              accept="video/*"
              ariaLabel="Upload banner video"
              boxClassName={videoUploadBoxClass}
              disabled={isBusy}
              isUploading={isUploadingVideo}
              isBusy={isBusy}
              onChange={handleVideoUpload}
              emptyIcon={Video}
              preview={
                formState.video ? (
                  <video
                    key={formState.video}
                    src={formState.video}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null
              }
            />

            {formState.video ? (
              <div className="flex max-w-xs justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveVideo}
                  disabled={isBusy}
                >
                  {isRemovingVideo ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 size-4" />
                  )}
                  Remove
                </Button>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-title">Video Title</Label>
            <Input
              id="video-title"
              placeholder="Watch Our Story"
              value={formState.video_title}
              onChange={(event) => updateField("video_title", event.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-description">Video Description</Label>
            <Textarea
              id="video-description"
              placeholder="See how our jewelry is made"
              value={formState.video_description}
              onChange={(event) => updateField("video_description", event.target.value)}
              disabled={isBusy}
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSaveAll} disabled={isBusy}>
          {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
