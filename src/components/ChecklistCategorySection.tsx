"use client";

import type {
  ChecklistCategory,
  ItemSelection,
  PriceTier,
} from "@/lib/types";
import { cn } from "@/lib/cn";
import ChecklistItemRow from "./ChecklistItemRow";

interface ChecklistCategorySectionProps {
  category: ChecklistCategory;
  selections: Record<string, ItemSelection>;
  onTierChange: (id: string, tier: PriceTier) => void;
  onPriceChange: (id: string, price: number | null) => void;
  onToggleOwned: (id: string) => void;
  onRemove: (id: string) => void;
  headerTint?: "accent" | "secondary" | "tertiary" | "quaternary";
}

const headerTintClass = {
  accent: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-foreground",
  tertiary: "bg-tertiary text-foreground",
  quaternary: "bg-quaternary text-foreground",
};

export default function ChecklistCategorySection({
  category,
  selections,
  onTierChange,
  onPriceChange,
  onToggleOwned,
  onRemove,
  headerTint = "accent",
}: ChecklistCategorySectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border-2 border-foreground bg-card shadow-sticker">
      <header
        className={cn(
          "flex items-center justify-between border-b-2 border-foreground px-6 py-3",
          headerTintClass[headerTint]
        )}
      >
        <h3 className="font-heading text-lg font-bold">{category.name}</h3>
        <span className="rounded-full border-2 border-foreground/30 bg-white/20 px-3 py-0.5 font-body text-sm font-semibold">
          {category.items.length} items
        </span>
      </header>

      <ul className="divide-y-2 divide-border px-2">
        {category.items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            selection={selections[item.id]}
            onTierChange={onTierChange}
            onPriceChange={onPriceChange}
            onToggleOwned={onToggleOwned}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </section>
  );
}
