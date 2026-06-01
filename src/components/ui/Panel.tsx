import { cn } from "@/lib/cn";

type PanelProps = React.HTMLAttributes<HTMLDivElement>;

export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-foreground bg-card shadow-sticker",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
