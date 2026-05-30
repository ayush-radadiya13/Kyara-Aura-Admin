import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function SettingsPage() {
  return (
    <section>
      <PageHeader
        title="Settings"
        description="Configure your admin panel preferences."
      />

      <EmptyState
        title="Settings module coming soon"
        description="This page is ready and no longer returns 404."
      />
    </section>
  );
}
