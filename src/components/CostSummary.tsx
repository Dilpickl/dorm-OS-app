import { budgetTierLabel, formatBudget } from "@/lib/budget";
import type { Budget } from "@/lib/types";
import { cn } from "@/lib/cn";

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
  const difference = knowsBudget ? estimatedTotal - budget : 0;
  const overBudget = difference > 0;
  const percent = knowsBudget
    ? Math.min(100, Math.round((estimatedTotal / budget) * 100))
    : 0;

  return (
    <div className="rounded-xl border-2 border-foreground bg-card p-6 shadow-sticker-pink">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-body text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Estimated total
          </p>
          <p className="font-heading text-4xl font-bold text-foreground">
            ${estimatedTotal.toLocaleString()}
          </p>
          <p className="mt-1 font-body text-xs text-muted-foreground">
            {itemCount} item{itemCount === 1 ? "" : "s"}
            {ownedCount > 0 ? ` · ${ownedCount} already owned` : ""}
          </p>
        </div>

        <div className="text-right">
          {knowsBudget ? (
            <>
              <p className="font-body text-sm text-muted-foreground">
                Target: {formatBudget(budget)}
              </p>
              <p
                className={cn(
                  "font-heading text-lg font-bold",
                  overBudget ? "text-secondary" : "text-quaternary"
                )}
              >
                {overBudget
                  ? `$${difference.toLocaleString()} over`
                  : `$${Math.abs(difference).toLocaleString()} under`}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {budgetTierLabel(budget)} budget
              </p>
            </>
          ) : (
            <>
              <p className="font-body text-sm text-muted-foreground">
                Estimated budget
              </p>
              <p className="font-heading text-lg font-bold text-accent">
                {budgetTierLabel(estimatedTotal)}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                based on your picks
              </p>
            </>
          )}
        </div>
      </div>

      {knowsBudget && (
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full border-2 border-foreground bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-bounce",
              overBudget ? "bg-secondary" : "bg-quaternary"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
