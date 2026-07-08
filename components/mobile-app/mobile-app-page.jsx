"use client";

import { useState } from "react";
import { MobileAppBottomNav } from "./mobile-app-bottom-nav";
import { MobileAppOrdersPanel } from "./mobile-app-orders-panel";
import { MobileAppReturnsPanel } from "./mobile-app-returns-panel";

export function MobileAppPage() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="relative -mx-4 -mb-4 flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-[#f4f6f9]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === "orders" ? (
          <MobileAppOrdersPanel />
        ) : (
          <MobileAppReturnsPanel />
        )}
      </div>

      <MobileAppBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
