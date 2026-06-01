import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border-foreground bg-accent text-accent-foreground shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-sm motion-reduce:hover:translate-0 motion-reduce:active:translate-0",
  secondary:
    "border-foreground bg-transparent text-foreground shadow-none hover:bg-tertiary motion-reduce:hover:translate-0",
  ghost:
    "border-transparent bg-transparent text-foreground shadow-none hover:bg-muted motion-reduce:hover:translate-0",
};

const baseClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 px-6 py-2.5 font-heading text-base font-bold transition-[transform,box-shadow,background-color] duration-300 ease-bounce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none";

type CommonProps = {
  variant?: ButtonVariant;
  showArrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  showArrow = false,
  className,
  children,
  ...props
}: CommonProps &
  (
    | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const classes = cn(baseClass, variantClass[variant], className);

  const content = (
    <>
      {children}
      {showArrow && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </span>
      )}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
