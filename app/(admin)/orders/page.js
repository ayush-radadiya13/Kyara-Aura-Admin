import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function OrdersPage() {
  return (
    <section>
      <PageHeader
        title="Orders"
        description="Track and manage customer order activity."
      />

      <EmptyState
        title="Orders module coming soon"
        description="This page is ready and no longer returns 404."
      />
    </section>
  );
}
