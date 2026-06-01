"use client";

// One category card (e.g. "Bedding") containing its list of item rows.
//
// Like ChecklistItemRow, this is presentational: it receives the current
// selection for every item plus the handlers, and passes them straight
// through to each row.

import { effectivePrice } from "@/lib/budget";
import type {
  ChecklistCategory,
  ItemSelection,
  PriceTier,
} from "@/lib/types";
import ChecklistItemRow from "./ChecklistItemRow";

interface ChecklistCategorySectionProps {
  category: ChecklistCategory;
  selections: Record<string, ItemSelection>;
  onTierChange: (id: string, tier: PriceTier) => void;
  onPriceChange: (id: string, price: number | null) => void;
  onToggleOwned: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ChecklistCategorySection({
  category,
  selections,
  onTierChange,
  onPriceChange,
  onToggleOwned,
  onRemove,
}: ChecklistCategorySectionProps) {
  // The running cost of just this category (excludes owned items).
  const categoryTotal = category.items.reduce((sum, item) => {
    const selection = selections[item.id];
    return selection ? sum + effectivePrice(item, selection) : sum;
  }, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          {category.name}
        </h3>
        <span className="text-sm font-medium text-slate-500">
          ${categoryTotal.toLocaleString()}
        </span>
      </div>

      <ul className="mt-2 divide-y divide-slate-100">
        {category.items.map((item) => {
          const selection = selections[item.id];
          if (!selection) return null;
          return (
            <ChecklistItemRow
              key={item.id}
              item={item}
              selection={selection}
              onTierChange={onTierChange}
              onPriceChange={onPriceChange}
              onToggleOwned={onToggleOwned}
              onRemove={onRemove}
            />
          );
        })}
      </ul>
    </section>
  );
}
