"use client";

// A single row in the checklist.
//
// Each row lets the student:
//   - mark the item as "already owned" (removes it from the total)
//   - pick a price tier (Bare minimum / Standard / Comfortable / Premium)
//   - type a custom price that overrides the tier
//   - open a (mock) shopping link
//   - remove the item from the list entirely
//
// This is a "presentational" component: it holds no state of its own. The
// parent (ChecklistView) owns the selection for every item and passes down
// handlers, so the total at the top always stays in sync.

import { PRICE_TIER_OPTIONS } from "@/lib/budget";
import type { ChecklistItem, ItemSelection, PriceTier } from "@/lib/types";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  selection: ItemSelection;
  onTierChange: (id: string, tier: PriceTier) => void;
  onPriceChange: (id: string, price: number | null) => void;
  onToggleOwned: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ChecklistItemRow({
  item,
  selection,
  onTierChange,
  onPriceChange,
  onToggleOwned,
  onRemove,
}: ChecklistItemRowProps) {
  const { tier, customPrice, owned } = selection;

  // The price shown in the input: a custom override if present, otherwise the
  // selected tier's price.
  const shownPrice = customPrice ?? item.prices[tier];

  return (
    <li
      className={
        "py-4 transition " + (owned ? "opacity-50" : "")
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Already-own toggle */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={owned}
            onChange={() => onToggleOwned(item.id)}
            className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="sr-only">Already own {item.name}</span>
        </label>

        {/* Item name + link */}
        <div className="min-w-[10rem] flex-1">
          <p
            className={
              "font-medium text-slate-800 " +
              (owned ? "line-through" : "")
            }
          >
            {item.name}
          </p>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            View options
          </a>
        </div>

        {/* Editable price */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400">$</span>
          <input
            type="number"
            min={0}
            value={shownPrice}
            disabled={owned}
            onChange={(e) => {
              const raw = e.target.value;
              onPriceChange(item.id, raw === "" ? null : Number(raw));
            }}
            aria-label={`Price for ${item.name}`}
            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-400"
          />
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="rounded-md px-2 py-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        >
          Remove
        </button>
      </div>

      {/* Tier selector */}
      <div className="mt-3 flex flex-wrap gap-1.5 pl-8">
        {PRICE_TIER_OPTIONS.map((option) => {
          const active = option.value === tier && customPrice === null;
          return (
            <button
              key={option.value}
              type="button"
              disabled={owned}
              onClick={() => onTierChange(item.id, option.value)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 " +
                (active
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600")
              }
            >
              {option.label}{" "}
              <span className={active ? "text-indigo-100" : "text-slate-400"}>
                ${item.prices[option.value]}
              </span>
            </button>
          );
        })}
      </div>
    </li>
  );
}
