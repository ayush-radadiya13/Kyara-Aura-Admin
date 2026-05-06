import { cn } from "@/lib/utils";

export function PageHeader({ title, description, action, className }) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center",
        className
      )}
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
