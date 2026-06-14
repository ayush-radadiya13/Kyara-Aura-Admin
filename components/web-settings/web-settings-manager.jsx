"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, RotateCw, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  buildWebSettingsPayload,
  defaultWebSettings,
} from "@/components/web-settings/web-settings-utils";
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
import { useWebSettings } from "@/hooks/admin/module/use-web-settings";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { uploadMediaFile } from "@/services/media-service";
import { customAxios } from "@/utils/api";

function WebSettingsSkeleton() {
  return (
    <Card className="max-w-3xl border-border/70">
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-5">
        <Skeleton className="h-24 w-48 rounded-lg" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}

export function WebSettingsManager() {
  const queryClient = useQueryClient();
  const logoInputRef = useRef(null);
  const { data, isLoading, isFetching, refetch } = useWebSettings();
  const [formValues, setFormValues] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const currentValues = formValues ?? data ?? defaultWebSettings;

  const updateField = (field, value) => {
    setFormValues((current) => ({
      ...(current ?? data ?? defaultWebSettings),
      [field]: value,
    }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const logoUrl = await uploadMediaFile(file, "settings");
      updateField("logo", logoUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Logo upload failed");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentValues.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!currentValues.mobile_number.trim()) {
      toast.error("Mobile number is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildWebSettingsPayload(currentValues);
      const { data: responseData } = await customAxios.put(
        ADMIN_API_ROUTES.UPDATE_WEB_SETTINGS,
        payload
      );

      toast.success(responseData?.message || "Web settings saved successfully");
      setFormValues(payload);
      await queryClient.invalidateQueries({ queryKey: ["web-settings"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <WebSettingsSkeleton />;
  }

  const actionDisabled = isSaving || isUploadingLogo;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <Card className="border-border/70">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Web Settings</CardTitle>
            <CardDescription>
              Manage public contact details and the storefront logo.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const result = await refetch();
              setFormValues(result.data ?? defaultWebSettings);
            }}
            disabled={actionDisabled || isFetching}
            className="w-fit border-border bg-white text-foreground hover:bg-white"
          >
            {isFetching ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RotateCw className="mr-2 size-4" />
            )}
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center">
              <div className="relative flex h-24 w-48 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
                {currentValues.logo ? (
                  <Image
                    src={currentValues.logo}
                    alt="Website logo"
                    fill
                    sizes="192px"
                    unoptimized
                    className="object-contain p-3"
                  />
                ) : (
                  <ImagePlus className="size-8 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <Input
                  id="web-settings-logo"
                  placeholder="http://your-domain.com/storage/settings/logo.png"
                  value={currentValues.logo}
                  onChange={(event) => updateField("logo", event.target.value)}
                  disabled={actionDisabled}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={logoInputRef}
                    id="web-settings-logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={actionDisabled}
                    onChange={handleLogoUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={actionDisabled}
                    className="border-border bg-white text-foreground hover:bg-white"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <ImagePlus className="mr-2 size-4" />
                    )}
                    Upload Logo
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Paste a logo URL or upload a new image.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="web-settings-email">Email</Label>
              <Input
                id="web-settings-email"
                type="email"
                placeholder="info@kayraaura.com"
                value={currentValues.email}
                onChange={(event) => updateField("email", event.target.value)}
                disabled={actionDisabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="web-settings-mobile">Mobile Number</Label>
              <Input
                id="web-settings-mobile"
                placeholder="+919999999999"
                value={currentValues.mobile_number}
                onChange={(event) => updateField("mobile_number", event.target.value)}
                disabled={actionDisabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="web-settings-address">Address</Label>
            <Textarea
              id="web-settings-address"
              placeholder="Your full business address here"
              value={currentValues.address}
              onChange={(event) => updateField("address", event.target.value)}
              disabled={actionDisabled}
              className="min-h-28"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={actionDisabled}>
              {isSaving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
