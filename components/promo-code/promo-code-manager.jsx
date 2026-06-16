"use client";

import { Loader2, RotateCw, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  buildPromoCodeSettingsPayload,
  defaultPromoCodeSettings,
  formatPromoCodeFieldLabel,
  isPromoCodeNumericField,
  isPromoCodeTextAreaField,
} from "@/components/promo-code/promo-code-utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { usePromoCodeSettings } from "@/hooks/admin/module/use-promo-code-settings";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";
import { useState } from "react";

const discountTypeOptions = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
];

function PromoCodeSettingsSkeleton() {
  return (
    <Card className="max-w-3xl border-border/70">
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}

function getDiscountOptions(currentValue) {
  if (
    currentValue &&
    !discountTypeOptions.some((option) => option.value === currentValue)
  ) {
    return [
      ...discountTypeOptions,
      { label: formatPromoCodeFieldLabel(currentValue), value: currentValue },
    ];
  }

  return discountTypeOptions;
}

export function PromoCodeManager() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = usePromoCodeSettings();
  const [formValues, setFormValues] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const currentValues = formValues ?? data ?? defaultPromoCodeSettings;

  const updateField = (field, value) => {
    setFormValues((current) => ({
      ...(current ?? data ?? defaultPromoCodeSettings),
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    try {
      const payload = buildPromoCodeSettingsPayload(currentValues);
      const { data: responseData } = await customAxios.put(
        ADMIN_API_ROUTES.UPDATE_SCRATCH_CARD_SETTINGS,
        payload
      );

      toast.success(responseData?.message || "Promo code settings saved successfully");
      setFormValues(payload);
      await queryClient.invalidateQueries({ queryKey: ["promo-code-settings"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PromoCodeSettingsSkeleton />;
  }

  const actionDisabled = isSaving;
  const fields = Object.entries(currentValues);

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <Card className="border-border/70">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Promo Code</CardTitle>
            <CardDescription>
              Manage scratch card promo code rules and discount settings.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const result = await refetch();
              setFormValues(result.data ?? defaultPromoCodeSettings);
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
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([field, value]) => {
              const fieldId = `promo-code-${field}`;
              const label = formatPromoCodeFieldLabel(field);

              if (typeof value === "boolean") {
                return (
                  <div
                    key={field}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 sm:col-span-2"
                  >
                    <Label htmlFor={fieldId}>{label}</Label>
                    <Switch
                      id={fieldId}
                      checked={value}
                      disabled={actionDisabled}
                      onCheckedChange={(checked) => updateField(field, checked)}
                    />
                  </div>
                );
              }

              if (field === "discount_type") {
                return (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={fieldId}>{label}</Label>
                    <Select
                      value={String(value || "percentage")}
                      disabled={actionDisabled}
                      onValueChange={(selectedValue) => updateField(field, selectedValue)}
                    >
                      <SelectTrigger id={fieldId}>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDiscountOptions(value).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              if (isPromoCodeTextAreaField(field)) {
                return (
                  <div key={field} className="space-y-2 sm:col-span-2">
                    <Label htmlFor={fieldId}>{label}</Label>
                    <Textarea
                      id={fieldId}
                      placeholder={label}
                      value={value ?? ""}
                      disabled={actionDisabled}
                      className="min-h-28"
                      onChange={(event) => updateField(field, event.target.value)}
                    />
                  </div>
                );
              }

              return (
                <div key={field} className="space-y-2">
                  <Label htmlFor={fieldId}>{label}</Label>
                  <Input
                    id={fieldId}
                    type={isPromoCodeNumericField(field, value) ? "number" : "text"}
                    min={isPromoCodeNumericField(field, value) ? "0" : undefined}
                    step={isPromoCodeNumericField(field, value) ? "any" : undefined}
                    placeholder={label}
                    value={value ?? ""}
                    disabled={actionDisabled}
                    onChange={(event) => updateField(field, event.target.value)}
                  />
                </div>
              );
            })}
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
