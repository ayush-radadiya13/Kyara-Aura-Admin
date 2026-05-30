import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function CustomersPage() {
  return (
    <section>
      <PageHeader
        title="Customers"
        description="View and manage your customer records."
      />

      <EmptyState
        title="Customers module coming soon"
        description="This page is ready and no longer returns 404."
      />
    </section>
  );
}
