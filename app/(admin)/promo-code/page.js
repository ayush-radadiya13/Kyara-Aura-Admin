import { PromoCodeManager } from "@/components/promo-code/promo-code-manager";
import { PageHeader } from "@/components/shared/page-header";

export default function PromoCodePage() {
  return (
    <section>
      <PageHeader
        title="Promo Code"
        description="Manage scratch card settings and view generated promo codes."
      />

      <PromoCodeManager />
    </section>
  );
}
