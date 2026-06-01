"use client";

// The onboarding form.
//
// "use client" tells Next.js this component runs in the browser, which we
// need because it uses React state (useState) and navigation (useRouter).
//
// When the student submits, we package their answers into a query string
// and navigate to /checklist, where the list is generated.

import { useRouter } from "next/navigation";
import { useState } from "react";
import BudgetSlider from "@/components/BudgetSlider";
import { BUDGET_DEFAULT } from "@/lib/budget";
import { CLIMATE_OPTIONS, DORM_OPTIONS, HOBBY_OPTIONS } from "@/lib/options";
import { answersToQuery } from "@/lib/params";
import type {
  Budget,
  Climate,
  DormType,
  Hobby,
  OnboardingAnswers,
} from "@/lib/types";

export default function OnboardingForm() {
  const router = useRouter();

  // One piece of state per answer. The form is "controlled", meaning React
  // is the single source of truth for every input's value.
  const [school, setSchool] = useState("");
  const [climate, setClimate] = useState<Climate>("four-season");
  const [budget, setBudget] = useState<number>(BUDGET_DEFAULT);
  const [dormType, setDormType] = useState<DormType>("traditional-double");
  const [hobbies, setHobbies] = useState<Hobby[]>([]);

  // Add or remove a hobby when its chip is clicked.
  function toggleHobby(hobby: Hobby) {
    setHobbies((current) =>
      current.includes(hobby)
        ? current.filter((h) => h !== hobby)
        : [...current, hobby]
    );
  }

  // Build the checklist. `budgetOverride` lets the "I don't know" button send
  // "unknown" instead of the slider value, so the checklist page estimates a
  // budget from the generated items instead.
  function goToChecklist(budgetValue: Budget) {
    const answers: OnboardingAnswers = {
      school: school.trim() || "your school",
      climate,
      budget: budgetValue,
      dormType,
      hobbies,
    };
    router.push(`/checklist?${answersToQuery(answers)}`);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    goToChecklist(budget);
  }

  // Shared Tailwind classes for the select/input elements.
  const fieldClasses =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <section
      id="onboarding"
      className="mx-auto max-w-2xl scroll-mt-8 px-6 py-16"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900">
          Tell us about your move-in
        </h2>
        <p className="mt-2 text-slate-600">
          It only takes a minute. Everything below shapes your checklist.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* School */}
          <div>
            <label htmlFor="school" className="block font-medium text-slate-800">
              School
            </label>
            <input
              id="school"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="e.g. University of Michigan"
              className={fieldClasses}
            />
          </div>

          {/* Climate */}
          <div>
            <label htmlFor="climate" className="block font-medium text-slate-800">
              Local climate
            </label>
            <select
              id="climate"
              value={climate}
              onChange={(e) => setClimate(e.target.value as Climate)}
              className={fieldClasses}
            >
              {CLIMATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dorm type */}
          <div>
            <label htmlFor="dormType" className="block font-medium text-slate-800">
              Dorm type
            </label>
            <select
              id="dormType"
              value={dormType}
              onChange={(e) => setDormType(e.target.value as DormType)}
              className={fieldClasses}
            >
              {DORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Budget slider + "I don't know" */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <BudgetSlider value={budget} onChange={setBudget} />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => goToChecklist("unknown")}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600"
              >
                I don&apos;t know
              </button>
              <span className="text-xs text-slate-500">
                We&apos;ll build your list first and estimate a budget from it.
              </span>
            </div>
          </div>

          {/* Hobbies (multi-select chips) */}
          <div>
            <span className="block font-medium text-slate-800">Hobbies</span>
            <p className="mt-1 text-sm text-slate-500">
              Pick any that apply. We&apos;ll add matching gear to your list.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {HOBBY_OPTIONS.map((option) => {
                const selected = hobbies.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleHobby(option.value)}
                    aria-pressed={selected}
                    className={
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition " +
                      (selected
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600")
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Build my checklist
          </button>
        </form>
      </div>
    </section>
  );
}
