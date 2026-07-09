"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MobileAppBottomNav } from "./mobile-app-bottom-nav";
import { MobileAppOrdersPanel } from "./mobile-app-orders-panel";
import { MobileAppReturnsPanel } from "./mobile-app-returns-panel";

const VALID_TABS = new Set(["orders", "returns"]);

export function MobileAppPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const activeTab = VALID_TABS.has(tabFromUrl) ? tabFromUrl : "orders";

  const handleTabChange = (tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/mobile-orders?${params.toString()}`);
  };

  return (
    <div className="relative -mx-4 -mb-4 flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-[#f4f6f9]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === "orders" ? (
          <MobileAppOrdersPanel />
        ) : (
          <MobileAppReturnsPanel />
        )}
      </div>

      <MobileAppBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
