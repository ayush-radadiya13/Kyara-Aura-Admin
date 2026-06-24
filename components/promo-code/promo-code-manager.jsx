"use client";

import { useMemo, useState } from "react";
import { Loader2, RotateCw, Save, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getPromoCodeColumns } from "@/components/promo-code/promo-code-columns";
import {
  buildPromoCodeSettingsPayload,
  defaultPromoCodeSettings,
  formatPromoCodeFieldLabel,
  isPromoCodeNumericField,
  isPromoCodeTextAreaField,
} from "@/components/promo-code/promo-code-utils";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useScratchCardCoupons } from "@/hooks/admin/module/use-scratch-card-coupons";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";
import { customAxios } from "@/utils/api";

const discountTypeOptions = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
];

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

function PromoCodeSettingsFields({ currentValues, disabled, onFieldChange }) {
  const fields = Object.entries(currentValues);

  return (
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
                disabled={disabled}
                onCheckedChange={(checked) => onFieldChange(field, checked)}
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
                disabled={disabled}
                onValueChange={(selectedValue) => onFieldChange(field, selectedValue)}
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
                disabled={disabled}
                className="min-h-28"
                onChange={(event) => onFieldChange(field, event.target.value)}
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
              disabled={disabled}
              onChange={(event) => onFieldChange(field, event.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}

function PromoCodeSettingsDialog({ open, onOpenChange }) {
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
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    const result = await refetch();
    setFormValues(result.data ?? defaultPromoCodeSettings);
  };

  const actionDisabled = isSaving;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) {
          setFormValues(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 pr-6">
              <div>
                <DialogTitle>Scratch Card Settings</DialogTitle>
                <DialogDescription>
                  Manage minimum order, maximum discount, and scratch card rules.
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={actionDisabled || isFetching}
                className="shrink-0 border-border bg-white text-foreground hover:bg-white"
              >
                {isFetching ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RotateCw className="mr-2 size-4" />
                )}
                Refresh
              </Button>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <PromoCodeSettingsFields
              currentValues={currentValues}
              disabled={actionDisabled}
              onFieldChange={updateField}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={actionDisabled}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={actionDisabled || isLoading}>
              {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Save Settings
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PromoCodeList({ onOpenSettings }) {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);
  const [search, setSearch] = useState("");

  const page = Math.floor(offset / limit) + 1;
  const { data, isLoading, isFetching, refetch } = useScratchCardCoupons(
    page,
    limit,
    search
  );

  const coupons = useMemo(() => data?.data || [], [data]);
  const totalCount = data?.meta?.total ?? coupons.length;
  const tableLoading = isLoading || isFetching;
  const columns = useMemo(() => getPromoCodeColumns(), []);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-border bg-white text-foreground hover:bg-white"
          >
            {isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCw className="size-4" />
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onOpenSettings}>
            <Settings className="mr-2 size-4" />
            Scratch Card Settings
          </Button>
      </div>

      {!tableLoading && coupons.length === 0 && !search.trim() ? (
        <EmptyState
          title="No promo codes yet"
          description="Scratch card promo codes will appear here once generated."
        />
      ) : (
        <DataTableWrapper
          offset={offset}
          limit={limit}
          total={totalCount}
          search={search}
          data={coupons}
          isLoading={tableLoading}
          getColumns={columns}
          onSearchAction={setSearch}
          onPageChangeAction={(newOffset, newLimit) => {
            setOffset(newOffset);
            setLimit(newLimit);
          }}
        />
      )}
    </div>
  );
}

export function PromoCodeManager() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div>
      <PromoCodeList onOpenSettings={() => setSettingsOpen(true)} />
      <PromoCodeSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
