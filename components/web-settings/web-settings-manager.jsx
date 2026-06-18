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

function InstagramIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
      />
    </svg>
  );
}

function FacebookIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"
      />
    </svg>
  );
}

function SocialFieldLabel({ htmlFor, icon: Icon, label, iconClassName }) {
  return (
    <Label htmlFor={htmlFor} className="flex items-center gap-2">
      <Icon className={iconClassName} />
      {label}
    </Label>
  );
}

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
              Manage public contact details, storefront logo, and social links.
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
              <div className="min-w-0 flex-1">
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
                    Upload a new logo image.
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

          <div className="space-y-4 rounded-lg border border-border p-4">
            <div>
              <h3 className="text-sm font-medium">Social Links</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                These URLs appear on the storefront footer and WhatsApp button.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <SocialFieldLabel
                  htmlFor="web-settings-instagram"
                  icon={InstagramIcon}
                  label="Instagram"
                  iconClassName="size-4 text-[#E4405F]"
                />
                <Input
                  id="web-settings-instagram"
                  type="url"
                  value={currentValues.instagram_url}
                  onChange={(event) => updateField("instagram_url", event.target.value)}
                  disabled={actionDisabled}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <SocialFieldLabel
                  htmlFor="web-settings-facebook"
                  icon={FacebookIcon}
                  label="Facebook"
                  iconClassName="size-4 text-[#1877F2]"
                />
                <Input
                  id="web-settings-facebook"
                  type="url"
                  value={currentValues.facebook_url}
                  onChange={(event) => updateField("facebook_url", event.target.value)}
                  disabled={actionDisabled}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <SocialFieldLabel
                  htmlFor="web-settings-whatsapp"
                  icon={WhatsAppIcon}
                  label="WhatsApp"
                  iconClassName="size-4 text-[#25D366]"
                />
                <Input
                  id="web-settings-whatsapp"
                  type="url"
                  value={currentValues.whatsapp_url}
                  onChange={(event) => updateField("whatsapp_url", event.target.value)}
                  disabled={actionDisabled}
                />
              </div>
            </div>
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
