"use client";

import { useParams } from "next/navigation";
import { MobileOrderDetailsView } from "@/components/mobile-app/mobile-order-details-view";

export default function MobileOrderDetailsPage() {
  const params = useParams();
  const orderId = String(params?.id ?? "");

  return <MobileOrderDetailsView orderId={orderId} />;
}
