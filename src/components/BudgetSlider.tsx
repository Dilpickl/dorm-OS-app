"use client";

import { useEffect, useState } from "react";
import {
  BUDGET_MAX,
  BUDGET_MIN,
  BUDGET_STEP,
  budgetTierLabel,
  clampBudget,
  formatBudget,
} from "@/lib/budget";
import { labelClass } from "@/lib/design/forms";

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commitDraft() {
    const next = clampBudget(Number(draft));
    onChange(next);
    setDraft(String(next));
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={labelClass}>Budget</span>

        <div className="flex items-baseline gap-1 text-accent">
          <span className="font-heading text-2xl font-bold">$</span>
          <input
            type="number"
            inputMode="numeric"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitDraft();
              }
            }}
            aria-label="Budget amount in dollars"
            className="w-24 rounded-md border-2 border-transparent bg-transparent text-right font-heading text-2xl font-bold text-accent hover:border-border focus:border-accent focus:bg-input focus:outline-none focus:shadow-pop-accent"
          />
          {value >= BUDGET_MAX && (
            <span className="font-heading text-2xl font-bold">+</span>
          )}
        </div>
      </div>

      <input
        type="range"
        min={BUDGET_MIN}
        max={BUDGET_MAX}
        step={BUDGET_STEP}
        value={value}
        onChange={(e) => onChange(clampBudget(Number(e.target.value)))}
        aria-label="Budget slider"
        className="mt-4 h-2 w-full cursor-pointer accent-accent"
      />

      <div className="mt-1 flex justify-between font-body text-xs text-muted-foreground">
        <span>{formatBudget(BUDGET_MIN)}</span>
        <span>{formatBudget(BUDGET_MAX)}</span>
      </div>

      <p className="mt-3 font-body text-sm text-muted-foreground">
        Tier:{" "}
        <span className="font-semibold text-foreground">
          {budgetTierLabel(value)}
        </span>
      </p>
    </div>
  );
}
