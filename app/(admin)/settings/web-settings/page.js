import { PageHeader } from "@/components/shared/page-header";
import { WebSettingsManager } from "@/components/web-settings/web-settings-manager";

export default function WebSettingsPage() {
  return (
    <section>
      <PageHeader
        title="Web Settings"
        description="Manage website contact details and logo."
      />

      <WebSettingsManager />
    </section>
  );
}
