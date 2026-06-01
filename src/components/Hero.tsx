import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroIllustration, SceneDecor } from "@/components/ui/SceneDecor";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-foreground">
      <SceneDecor />
      <div className="bg-dot-grid/40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-pop-in text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 font-body text-sm font-medium text-foreground shadow-pop-sm">
              <Sparkles
                className="h-4 w-4 text-tertiary"
                strokeWidth={2.5}
                aria-hidden
              />
              Your dorm move-in, sorted.
            </span>

            <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Dorm Living{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-accent">OS</span>
                <span
                  className="absolute -bottom-1 left-0 right-0 h-3 bg-tertiary/70 -rotate-1"
                  aria-hidden
                />
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl font-body text-lg leading-relaxed text-muted-foreground lg:mx-0">
              Answer a few quick questions about your school, climate, budget, and
              hobbies. We&apos;ll build a personalized shopping checklist with
              recommended items, estimated costs, and links so you arrive on campus
              ready for anything.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Button href="#onboarding" showArrow>
                Get started
              </Button>
              <Button href="#how-it-works" variant="secondary">
                How it works
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
