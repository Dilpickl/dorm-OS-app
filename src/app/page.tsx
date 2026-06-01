import type { ReactNode } from "react";
import {
  ClipboardList,
  MessageCircleQuestion,
  PartyPopper,
} from "lucide-react";
import Hero from "@/components/Hero";
import OnboardingForm from "@/components/OnboardingForm";
import { StickerCard, type StickerAccent } from "@/components/ui/StickerCard";

const STEPS: {
  title: string;
  body: string;
  icon: ReactNode;
  accent: StickerAccent;
}[] = [
  {
    title: "1. Answer a few questions",
    body: "Your school, climate, budget, dorm type, and hobbies.",
    icon: <MessageCircleQuestion className="h-5 w-5" strokeWidth={2.5} />,
    accent: "accent",
  },
  {
    title: "2. Get a tailored checklist",
    body: "We pick recommended items with estimated costs and links.",
    icon: <ClipboardList className="h-5 w-5" strokeWidth={2.5} />,
    accent: "secondary",
  },
  {
    title: "3. Check off & export",
    body: "Tick items as you shop and export your list to keep or share.",
    icon: <PartyPopper className="h-5 w-5" strokeWidth={2.5} />,
    accent: "tertiary",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />

      <section id="how-it-works" className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-lg font-body text-muted-foreground">
            Three quick steps from questions to a printable, shoppable list.
          </p>
        </div>

        <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
          <svg
            className="pointer-events-none absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 sm:block"
            aria-hidden
          >
            <line
              x1="18%"
              y1="50%"
              x2="82%"
              y2="50%"
              stroke="#1E293B"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>
          {STEPS.map((step) => (
            <StickerCard
              key={step.title}
              title={step.title}
              icon={step.icon}
              accent={step.accent}
            >
              {step.body}
            </StickerCard>
          ))}
        </div>
      </section>

      <OnboardingForm />
    </main>
  );
}
