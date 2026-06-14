import { SizeManager } from "@/components/size/size-manager";
import { PageHeader } from "@/components/shared/page-header";

export default function SizeSettingsPage() {
  return (
    <section>
      <PageHeader
        title="Sizes"
        description="Manage product sizes and their dropdown order."
      />

      <SizeManager />
    </section>
  );
}
