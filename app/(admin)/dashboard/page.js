import { Activity, Boxes, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const stats = [
  { label: "Total Categories", value: "24", icon: Boxes },
  { label: "Active Users", value: "1,420", icon: Users },
  { label: "Live Sessions", value: "138", icon: Activity },
];

export default function DashboardPage() {
  return (
    <section>
      <PageHeader
        title="Dashboard"
        description="Track your platform performance and business activity."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.label}
              className="panel-shadow rounded-2xl border-border/70 transition-all duration-300 hover:-translate-y-0.5"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="rounded-full bg-secondary/40 p-2 text-primary">
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
