import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "saved" | "muted";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border-2 border-foreground px-3 py-1 font-body text-xs font-medium",
        variant === "default" && "bg-card shadow-pop-sm",
        variant === "saved" && "bg-quaternary/30 text-foreground",
        variant === "muted" && "border-border bg-muted text-muted-foreground shadow-none",
        className
      )}
    >
      {children}
    </span>
  );
}
