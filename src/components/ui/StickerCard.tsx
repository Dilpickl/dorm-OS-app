import { cn } from "@/lib/cn";

export type StickerAccent = "accent" | "secondary" | "tertiary" | "quaternary";

const accentBg: Record<StickerAccent, string> = {
  accent: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-foreground",
  tertiary: "bg-tertiary text-foreground",
  quaternary: "bg-quaternary text-foreground",
};

interface StickerCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  accent?: StickerAccent;
  featured?: boolean;
  className?: string;
}

export function StickerCard({
  title,
  children,
  icon,
  accent = "accent",
  featured = false,
  className,
}: StickerCardProps) {
  return (
    <article
      className={cn(
        "group relative rounded-xl border-2 border-foreground bg-card p-6 pt-8 transition duration-300 ease-bounce motion-reduce:transition-none",
        featured ? "shadow-sticker-pink" : "shadow-sticker",
        "hover:-rotate-1 hover:scale-[1.02] motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "absolute -top-5 left-6 flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground group-hover-wiggle",
            accentBg[accent]
          )}
        >
          {icon}
        </div>
      )}
      <h3 className="font-heading text-lg font-bold text-foreground">{title}</h3>
      <div className="mt-2 font-body text-muted-foreground">{children}</div>
    </article>
  );
}
