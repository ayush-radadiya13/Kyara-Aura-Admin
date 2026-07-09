"use client";

import { useParams } from "next/navigation";
import { MobileReturnOrderDetailsView } from "@/components/mobile-app/mobile-return-order-details-view";

export default function MobileReturnOrderDetailsPage() {
  const params = useParams();
  const returnRequestId = String(params?.id ?? "");

  return <MobileReturnOrderDetailsView returnRequestId={returnRequestId} />;
}
