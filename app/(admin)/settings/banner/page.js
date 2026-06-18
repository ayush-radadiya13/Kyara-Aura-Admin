import { BannerManager } from "@/components/banner/banner-manager";
import { PageHeader } from "@/components/shared/page-header";

export default function BannerSettingsPage() {
  return (
    <section>
      <PageHeader
        title="Banner"
        description="Manage banner images, video, and shared copy for the storefront."
      />

      <BannerManager />
    </section>
  );
}
