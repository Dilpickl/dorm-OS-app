"use client";

// The budget slider used in the onboarding form.
//
// It is a "controlled" component: the parent form owns the numeric value and
// passes it in, and we report changes back through `onChange`. The slider and
// the editable number box stay in sync because they both read/write that one
// value.
//
// Features required by the product spec:
//   - range $100 -> $2000 (shown as "$2000+" at the top)
//   - default handled by the parent (we just display whatever we're given)
//   - the value is clickable / directly editable by keyboard
//   - a live "tier" label below the slider

import { useEffect, useState } from "react";
import {
  BUDGET_MAX,
  BUDGET_MIN,
  BUDGET_STEP,
  budgetTierLabel,
  clampBudget,
  formatBudget,
} from "@/lib/budget";

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  // The editable text box keeps its own draft string so the user can type
  // freely (e.g. clear it, type "1500") without us clamping mid-keystroke.
  // We commit the clamped number to the parent when they blur or press Enter.
  const [draft, setDraft] = useState(String(value));

  // Keep the draft in sync when the value changes from the slider.
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
        <span className="block font-medium text-slate-800">Budget</span>

        {/* Clickable / editable value display. */}
        <div className="flex items-baseline gap-1 text-indigo-600">
          <span className="text-2xl font-bold">$</span>
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
            className="w-24 rounded-md border border-transparent bg-transparent text-right text-2xl font-bold text-indigo-600 hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          {value >= BUDGET_MAX && (
            <span className="text-2xl font-bold">+</span>
          )}
        </div>
      </div>

      {/* The slider itself. */}
      <input
        type="range"
        min={BUDGET_MIN}
        max={BUDGET_MAX}
        step={BUDGET_STEP}
        value={value}
        onChange={(e) => onChange(clampBudget(Number(e.target.value)))}
        aria-label="Budget slider"
        className="mt-4 w-full cursor-pointer accent-indigo-600"
      />

      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{formatBudget(BUDGET_MIN)}</span>
        <span>{formatBudget(BUDGET_MAX)}</span>
      </div>

      {/* Live tier label. */}
      <p className="mt-3 text-sm text-slate-600">
        Tier:{" "}
        <span className="font-semibold text-slate-900">
          {budgetTierLabel(value)}
        </span>
      </p>
    </div>
  );
}
