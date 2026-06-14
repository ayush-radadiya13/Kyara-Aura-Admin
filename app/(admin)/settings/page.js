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

      <div className="grid max-w-5xl gap-4 md:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Web Settings</CardTitle>
            <CardDescription>
              Manage website contact details, address, mobile number, and logo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/web-settings">
              <Button>Open Web Settings</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/70">
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

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Sizes</CardTitle>
            <CardDescription>
              Manage product sizes and their dropdown order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/sizes">
              <Button>Open Size Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
