import { BannerManager } from "@/components/banner/banner-manager";
import { PageHeader } from "@/components/shared/page-header";

export default function BannerSettingsPage() {
  return (
    <section>
      <PageHeader
        title="Banner"
        description="Manage the four banner images displayed across the storefront."
      />

      <BannerManager />
    </section>
  );
}
