// The home page.
//
// This is a server component that simply stitches together the hero, a short
// "how it works" explainer, and the onboarding form. The form itself is a
// client component (it needs interactivity), but the page wrapping it does
// not, which is the recommended Next.js pattern.

import Hero from "@/components/Hero";
import OnboardingForm from "@/components/OnboardingForm";

const STEPS = [
  {
    title: "1. Answer a few questions",
    body: "Your school, climate, budget, dorm type, and hobbies.",
  },
  {
    title: "2. Get a tailored checklist",
    body: "We pick recommended items with estimated costs and links.",
  },
  {
    title: "3. Check off & export",
    body: "Tick items as you shop and export your list to keep or share.",
  },
];

export default function Home() {
  return (
    <main>
      <Hero />

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <OnboardingForm />

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        Dorm Living OS - a learning project. Prices and links are mock data.
      </footer>
    </main>
  );
}
