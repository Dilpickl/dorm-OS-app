import { cn } from "@/lib/cn";

/** Floating geometric shapes — hidden on small screens to avoid clutter */
export function SceneDecor({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div className="absolute -left-16 top-24 hidden h-48 w-48 rounded-full bg-tertiary/80 border-2 border-foreground md:block" />
      <div className="absolute right-8 top-12 hidden h-24 w-24 rotate-12 rounded-lg bg-secondary/70 border-2 border-foreground md:block" />
      <div
        className="absolute bottom-32 right-1/4 hidden h-0 w-0 border-l-[28px] border-r-[28px] border-b-[48px] border-l-transparent border-r-transparent border-b-accent/60 md:block"
        style={{ filter: "drop-shadow(3px 3px 0 #1e293b)" }}
      />
      <div className="absolute -right-10 bottom-16 hidden h-32 w-32 rounded-full bg-quaternary/50 border-2 border-foreground md:block" />
      <div className="absolute left-1/3 top-1/2 hidden h-4 w-4 rounded-full bg-secondary md:block" />
      <div className="absolute right-1/3 top-1/3 hidden h-3 w-3 rotate-45 bg-tertiary md:block" />
    </div>
  );
}

export function DotGridPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-foreground bg-dot-grid p-6 shadow-sticker",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Hero illustration built from primitives (no image asset) */
export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md animate-pop-in">
      <div className="absolute inset-8 rounded-full bg-tertiary/90 border-2 border-foreground shadow-pop" />
      <div className="absolute inset-0 bg-dot-grid opacity-60 blob-mask border-2 border-foreground" />
      <div className="absolute bottom-12 left-1/2 w-[85%] -translate-x-1/2 speech-bubble border-2 border-foreground bg-card p-6 shadow-pop-lg">
        <p className="font-heading text-xl font-bold text-foreground">
          Move-in ready!
        </p>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Checklist · Budget · Export
        </p>
        <div className="mt-4 flex gap-2">
          <span className="h-3 w-3 rounded-full bg-accent border border-foreground" />
          <span className="h-3 w-3 rounded-full bg-secondary border border-foreground" />
          <span className="h-3 w-3 rounded-full bg-quaternary border border-foreground" />
        </div>
      </div>
      <div className="absolute -right-2 top-8 flex h-14 w-14 items-center justify-center rounded-full bg-accent border-2 border-foreground text-accent-foreground font-heading font-bold shadow-pop">
        OS
      </div>
    </div>
  );
}
