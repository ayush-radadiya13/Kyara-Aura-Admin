import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardChartCard({
  title,
  description,
  children,
  isLoading = false,
  isError = false,
  className,
  contentClassName,
}) {
  return (
    <Card
      className={cn(
        "panel-shadow rounded-2xl border-border/70 transition-all duration-300",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn("pt-2", contentClassName)}>
        {isLoading ? (
          <div className="flex h-[280px] flex-col gap-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="flex-1 rounded-xl" />
          </div>
        ) : isError ? (
          <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 text-center text-sm text-muted-foreground">
            Unable to load chart data. Please try again.
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardEmptyState({ message = "No data available yet." }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
