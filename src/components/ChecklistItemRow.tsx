"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { PRICE_TIER_OPTIONS } from "@/lib/budget";
import { priceInputClass } from "@/lib/design/forms";
import { cn } from "@/lib/cn";
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
  const isUserAdded = item.id.startsWith("custom-");
  const shownPrice = customPrice ?? item.prices[tier];
  const [priceDraft, setPriceDraft] = useState<string | null>(null);

  useEffect(() => {
    setPriceDraft(null);
  }, [item.id, tier, customPrice, owned]);

  const commitPriceDraft = (raw: string) => {
    if (raw.trim() === "") {
      onPriceChange(item.id, null);
      return;
    }
    const next = Number(raw);
    if (!Number.isFinite(next) || next < 0) {
      onPriceChange(item.id, null);
      return;
    }
    onPriceChange(item.id, next);
  };

  const priceInputValue =
    priceDraft !== null ? priceDraft : String(shownPrice);

  return (
    <li className={cn("px-4 py-4 transition", owned && "opacity-55")}>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex shrink-0 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={owned}
            onChange={() => onToggleOwned(item.id)}
            className="h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-foreground accent-accent focus:ring-accent"
          />
          <span className="sr-only">Already own {item.name}</span>
        </label>

        <div className="min-w-[10rem] flex-1">
          <p
            className={cn(
              "font-body font-semibold text-foreground",
              owned && "line-through"
            )}
          >
            {item.name}
          </p>
          {item.link !== "#" && (
            <span className="group/link relative mt-0.5 inline-flex">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer sponsored"
                data-view-options-link
                aria-describedby={`view-options-tip-${item.id}`}
                className="inline-flex items-center gap-1 font-body text-xs font-semibold text-accent hover:underline"
              >
                View options
                <ExternalLink className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              </a>
              <span
                id={`view-options-tip-${item.id}`}
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full z-10 mt-1 w-max max-w-[220px] rounded-lg border-2 border-foreground bg-card px-2.5 py-1.5 font-body text-[10px] font-semibold leading-snug text-foreground opacity-0 shadow-pop-sm transition-opacity duration-200 group-hover/link:opacity-100 group-focus-within/link:opacity-100"
              >
                My personal recommendation. (paid link)
              </span>
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <span className="font-body text-sm text-muted-foreground">$</span>
          <input
            type="number"
            min={0}
            value={priceInputValue}
            disabled={owned}
            onFocus={() => setPriceDraft(String(shownPrice))}
            onChange={(e) => setPriceDraft(e.target.value)}
            onBlur={() => {
              if (priceDraft !== null) {
                commitPriceDraft(priceDraft);
                setPriceDraft(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            aria-label={`Price for ${item.name}`}
            className={priceInputClass}
          />
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="shrink-0 rounded-full border-2 border-transparent p-2 text-muted-foreground transition hover:border-foreground hover:bg-secondary/20 hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      {!isUserAdded && (
      <div className="mt-3 flex flex-wrap gap-1.5 pl-8">
        {PRICE_TIER_OPTIONS.map((option) => {
          const active = option.value === tier && customPrice === null;
          return (
            <button
              key={option.value}
              type="button"
              disabled={owned}
              onClick={() => onTierChange(item.id, option.value)}
              className={cn(
                "rounded-full border-2 px-3 py-1 font-body text-xs font-semibold transition duration-300 ease-bounce disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-foreground bg-accent text-accent-foreground shadow-pop-sm"
                  : "border-border bg-card text-foreground hover:border-foreground hover:bg-tertiary/50"
              )}
            >
              {option.label}{" "}
              <span
                className={
                  active ? "text-accent-foreground/80" : "text-muted-foreground"
                }
              >
                ${item.prices[option.value]}
              </span>
            </button>
          );
        })}
      </div>
      )}
    </li>
  );
}
