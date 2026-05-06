import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }) {
  return (
    <Card className="panel-shadow border-border/70">
      <CardContent className="py-16 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
