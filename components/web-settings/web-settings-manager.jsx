"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, RotateCw, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  buildWebSettingsPayload,
  defaultWebSettings,
  extractWebSettings,
  normalizeWebSettings,
  resolveLogoPreviewUrl,
  toLogoStoragePath,
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
import { Switch } from "@/components/ui/switch";
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

function YouTubeIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
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
    <Card className="w-full border-border/70">
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-24 w-full max-w-xs rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-28 w-full" />
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
  const logoPreviewUrl = resolveLogoPreviewUrl(
    currentValues.logo,
    currentValues.logo_url
  );

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
      const uploadedLogo = await uploadMediaFile(file, "settings");
      const logoPath = toLogoStoragePath(uploadedLogo);

      setFormValues((current) => ({
        ...(current ?? data ?? defaultWebSettings),
        logo: logoPath,
        logo_url: resolveLogoPreviewUrl(logoPath, uploadedLogo),
      }));
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
      setFormValues(
        normalizeWebSettings(extractWebSettings(responseData) || payload)
      );
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
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="w-full border-border/70">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Web Settings</CardTitle>
            <CardDescription>
              Manage public contact details, storefront logo, offer lines, and social links.
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
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex flex-col gap-4 rounded-lg border border-border p-4 lg:flex-row lg:items-center">
              <div className="relative flex h-24 w-full max-w-xs shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
                {logoPreviewUrl ? (
                  <Image
                    src={logoPreviewUrl}
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

          <div className="grid gap-5 lg:grid-cols-2">
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
            <div className="space-y-2 lg:col-span-2">
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
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="web-settings-footer-description">Footer Description</Label>
              <Textarea
                id="web-settings-footer-description"
                placeholder="Short description shown in the storefront footer"
                value={currentValues.footer_description}
                onChange={(event) =>
                  updateField("footer_description", event.target.value)
                }
                disabled={actionDisabled}
                className="min-h-24"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border p-4">
  <div>
    <h3 className="text-sm font-medium">Offer Lines</h3>
    <p className="mt-1 text-sm text-muted-foreground">
      Short promotional messages shown on the storefront. Leave blank to hide a line.
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
    <div className="space-y-2">
      <Label htmlFor="web-settings-offer-line1">Offer Line 1</Label>
      <Input
        id="web-settings-offer-line1"
        placeholder="e.g. Free shipping on orders above Rs 999"
        value={currentValues.offer_line1}
        onChange={(event) => updateField("offer_line1", event.target.value)}
        disabled={actionDisabled}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="web-settings-offer-line2">Offer Line 2</Label>
      <Input
        id="web-settings-offer-line2"
        placeholder="e.g. Extra 10% off on online payments"
        value={currentValues.offer_line2}
        onChange={(event) => updateField("offer_line2", event.target.value)}
        disabled={actionDisabled}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="web-settings-offer-line3">Offer Line 3</Label>
      <Input
        id="web-settings-offer-line3"
        placeholder="e.g. Buy 2 Get 1 Free on selected items"
        value={currentValues.offer_line3}
        onChange={(event) => updateField("offer_line3", event.target.value)}
        disabled={actionDisabled}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="web-settings-offer-line4">Offer Line 4</Label>
      <Input
        id="web-settings-offer-line4"
        placeholder="e.g. First order discount available"
        value={currentValues.offer_line4}
        onChange={(event) => updateField("offer_line4", event.target.value)}
        disabled={actionDisabled}
      />
    </div>
  </div>
</div>

          <div className="space-y-4 rounded-lg border border-border p-4">
            <div>
              <h3 className="text-sm font-medium">Promotions</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="web-settings-buy-two-get-one-free">
                  Buy 2 Get 1 Free
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable the buy two get one free offer on the storefront.
                </p>
              </div>
              <Switch
                id="web-settings-buy-two-get-one-free"
                checked={currentValues.buy_two_get_one_free_enabled}
                onCheckedChange={(checked) =>
                  updateField("buy_two_get_one_free_enabled", checked)
                }
                disabled={actionDisabled}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="web-settings-first-order-discount">
                  First Order Discount Amount
                </Label>
                <div className="relative">
                  <Input
                    id="web-settings-first-order-discount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="pr-10"
                    value={currentValues.first_order_discount_amount}
                    onChange={(event) =>
                      updateField(
                        "first_order_discount_amount",
                        event.target.value === "" ? 0 : Number(event.target.value)
                      )
                    }
                    disabled={actionDisabled}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rs
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="web-settings-online-payment-discount">
                  Online Payment Discount
                </Label>
                <div className="relative">
                  <Input
                    id="web-settings-online-payment-discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                    className="pr-8"
                    value={currentValues.online_payment_discount_percent}
                    onChange={(event) =>
                      updateField(
                        "online_payment_discount_percent",
                        event.target.value === "" ? 0 : Number(event.target.value)
                      )
                    }
                    disabled={actionDisabled}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border p-4">
            <div>
              <h3 className="text-sm font-medium">Social Links</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                These URLs appear on the storefront footer and WhatsApp button.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
                <SocialFieldLabel
                  htmlFor="web-settings-youtube"
                  icon={YouTubeIcon}
                  label="YouTube"
                  iconClassName="size-4 text-[#FF0000]"
                />
                <Input
                  id="web-settings-youtube"
                  type="url"
                  value={currentValues.youtube_url}
                  onChange={(event) => updateField("youtube_url", event.target.value)}
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
