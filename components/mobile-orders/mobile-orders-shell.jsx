"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MobileOrdersPage } from "./mobile-orders-page";
import { MobileReturnOrdersPage } from "./mobile-return-orders-page";
import { MobilePaymentTypeToggle, MobileTabBar } from "./mobile-tab-bar";

const PAYMENT_TYPES = ["cod", "online"];

const MOBILE_TABS = [
  { value: "orders", label: "Orders" },
  { value: "returns", label: "Return Orders" },
];

function getValidPaymentType(type) {
  return PAYMENT_TYPES.includes(type) ? type : "cod";
}

export function MobileOrdersShell() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("orders");

  const paymentType = getValidPaymentType(searchParams.get("type"));

  const updatePaymentType = useCallback(
    (nextType) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("type", nextType);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-gray-50">
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Mobile Orders</h1>
            <p className="text-xs text-muted-foreground">
              Manage orders and returns on the go
            </p>
          </div>
          <MobilePaymentTypeToggle
            value={paymentType}
            onChange={updatePaymentType}
          />
        </div>

        <MobileTabBar
          className="mt-3"
          tabs={MOBILE_TABS}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === "orders" ? (
          <MobileOrdersPage embedded orderType={paymentType} />
        ) : (
          <MobileReturnOrdersPage embedded returnType={paymentType} />
        )}
      </div>
    </div>
  );
}
