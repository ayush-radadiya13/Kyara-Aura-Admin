import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <section>
      <PageHeader
        title="Settings"
        description="Configure your admin panel preferences."
      />

      <Card className="max-w-xl border-border/70">
        <CardHeader>
          <CardTitle>Banner</CardTitle>
          <CardDescription>
            Manage the four storefront banner images and their upload previews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings/banner">
            <Button>Open Banner Settings</Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
