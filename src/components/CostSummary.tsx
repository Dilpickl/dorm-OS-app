// The budget summary bar pinned to the top of the checklist.
//
// It shows the live estimated total (which updates as the student changes
// tiers, edits prices, toggles "already own", or removes items) and compares
// it to their target budget. When the budget is "unknown" we instead present
// the total itself as the estimated budget, with its tier label.
//
// Presentational: it only displays the numbers it is given.

import { budgetTierLabel, formatBudget } from "@/lib/budget";
import type { Budget } from "@/lib/types";

interface CostSummaryProps {
  estimatedTotal: number;
  budget: Budget;
  itemCount: number;
  ownedCount: number;
}

export default function CostSummary({
  estimatedTotal,
  budget,
  itemCount,
  ownedCount,
}: CostSummaryProps) {
  const knowsBudget = budget !== "unknown";

  // For a known budget, how far over/under the target are we?
  const difference = knowsBudget ? estimatedTotal - budget : 0;
  const overBudget = difference > 0;

  // Progress bar fill (only meaningful with a numeric target).
  const percent = knowsBudget
    ? Math.min(100, Math.round((estimatedTotal / budget) * 100))
    : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Estimated total</p>
          <p className="text-3xl font-bold text-slate-900">
            ${estimatedTotal.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {itemCount} item{itemCount === 1 ? "" : "s"}
            {ownedCount > 0 ? ` - ${ownedCount} already owned` : ""}
          </p>
        </div>

        <div className="text-right">
          {knowsBudget ? (
            <>
              <p className="text-sm text-slate-500">
                Target: {formatBudget(budget)}
              </p>
              <p
                className={
                  "text-lg font-semibold " +
                  (overBudget ? "text-red-600" : "text-emerald-600")
                }
              >
                {overBudget
                  ? `$${difference.toLocaleString()} over`
                  : `$${Math.abs(difference).toLocaleString()} under`}
              </p>
              <p className="text-xs text-slate-400">
                {budgetTierLabel(budget)} budget
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500">Estimated budget</p>
              <p className="text-lg font-semibold text-indigo-600">
                {budgetTierLabel(estimatedTotal)}
              </p>
              <p className="text-xs text-slate-400">based on your picks</p>
            </>
          )}
        </div>
      </div>

      {knowsBudget && (
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={
              "h-full rounded-full transition-all " +
              (overBudget ? "bg-red-500" : "bg-emerald-500")
            }
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
