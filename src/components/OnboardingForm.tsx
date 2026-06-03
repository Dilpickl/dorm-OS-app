"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BudgetSlider from "@/components/BudgetSlider";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { BUDGET_DEFAULT } from "@/lib/budget";
import { fieldClass, labelClass, selectClass } from "@/lib/design/forms";
import { cn } from "@/lib/cn";
import { CLIMATE_OPTIONS, DORM_OPTIONS, HOBBY_OPTIONS } from "@/lib/options";
import { answersToQuery } from "@/lib/params";
import { SCHOOL_MAX_LENGTH } from "@/lib/security/limits";
import type {
  Budget,
  Climate,
  DormType,
  Hobby,
  OnboardingAnswers,
} from "@/lib/types";

export default function OnboardingForm() {
  const router = useRouter();

  const [school, setSchool] = useState("");
  const [climate, setClimate] = useState<Climate>("four-season");
  const [budget, setBudget] = useState<number>(BUDGET_DEFAULT);
  const [dormType, setDormType] = useState<DormType>("traditional-double");
  const [hobbies, setHobbies] = useState<Hobby[]>([]);

  function toggleHobby(hobby: Hobby) {
    setHobbies((current) =>
      current.includes(hobby)
        ? current.filter((h) => h !== hobby)
        : [...current, hobby]
    );
  }

  function goToChecklist(budgetValue: Budget) {
    const answers: OnboardingAnswers = {
      school: school.trim().slice(0, SCHOOL_MAX_LENGTH) || "your school",
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

  return (
    <section
      id="onboarding"
      className="relative mx-auto max-w-2xl scroll-mt-8 px-6 py-20"
    >
      <SceneDecor />
      <Panel className="relative animate-pop-in p-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Tell us about your move-in
        </h2>
        <p className="mt-2 font-body text-muted-foreground">
          It only takes a minute. Everything below shapes your checklist.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="school" className={labelClass}>
              School
            </label>
            <input
              id="school"
              type="text"
              value={school}
              maxLength={SCHOOL_MAX_LENGTH}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="e.g. University of Illinois"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="climate" className={labelClass}>
              Local climate
            </label>
            <select
              id="climate"
              value={climate}
              onChange={(e) => setClimate(e.target.value as Climate)}
              className={selectClass}
            >
              {CLIMATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dormType" className={labelClass}>
              Dorm type
            </label>
            <select
              id="dormType"
              value={dormType}
              onChange={(e) => setDormType(e.target.value as DormType)}
              className={selectClass}
            >
              {DORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border-2 border-foreground bg-muted/50 p-5 shadow-pop-sm">
            <BudgetSlider value={budget} onChange={setBudget} />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                className="min-h-10 px-4 py-2 text-sm"
                onClick={() => goToChecklist("unknown")}
              >
                I don&apos;t know
              </Button>
              <span className="font-body text-xs text-muted-foreground">
                We&apos;ll build your list first and estimate a budget from it.
              </span>
            </div>
          </div>

          <div>
            <span className={labelClass}>Hobbies</span>
            <p className="mt-1 font-body text-sm text-muted-foreground">
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
                    className={cn(
                      "rounded-full border-2 px-4 py-1.5 font-body text-sm font-semibold transition duration-300 ease-bounce",
                      selected
                        ? "border-foreground bg-accent text-accent-foreground shadow-pop-sm"
                        : "border-border bg-card text-foreground hover:border-foreground hover:bg-tertiary/40"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" showArrow className="w-full">
            Build my checklist
          </Button>
        </form>
      </Panel>
    </section>
  );
}
