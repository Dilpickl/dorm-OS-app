"use client";

// The interactive heart of the results page.
//
// This client component owns all the per-item state for the checklist:
//   - which price tier each item uses
//   - any custom price the student typed
//   - whether each item is "already owned"
//   - which items have been removed
//
// Everything else (the summary total, the category cards, the exports) is
// derived from this state, so the estimated total at the top always stays in
// sync the moment anything changes.

import { useMemo, useState } from "react";
import Link from "next/link";
import { effectivePrice, priceTierLabel } from "@/lib/budget";
import { climateLabel, dormLabel } from "@/lib/options";
import type {
  ChecklistCategory,
  ItemSelection,
  OnboardingAnswers,
  PriceTier,
} from "@/lib/types";
import ChecklistCategorySection from "./ChecklistCategorySection";
import CostSummary from "./CostSummary";
import ExportButtons, { type ExportCategory } from "./ExportButtons";

interface ChecklistViewProps {
  answers: OnboardingAnswers;
  categories: ChecklistCategory[];
}

// Build the starting selection for every item: its default tier, no custom
// price, and not yet owned.
function buildInitialSelections(
  categories: ChecklistCategory[]
): Record<string, ItemSelection> {
  const selections: Record<string, ItemSelection> = {};
  for (const category of categories) {
    for (const item of category.items) {
      selections[item.id] = {
        tier: item.defaultTier,
        customPrice: null,
        owned: false,
      };
    }
  }
  return selections;
}

export default function ChecklistView({
  answers,
  categories,
}: ChecklistViewProps) {
  // Lazy initializer (the function runs only on the first render).
  const [selections, setSelections] = useState<Record<string, ItemSelection>>(
    () => buildInitialSelections(categories)
  );
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  // ----- Update handlers -----

  // Switching tiers clears any custom price so the tier price takes effect.
  function handleTierChange(id: string, tier: PriceTier) {
    setSelections((current) => ({
      ...current,
      [id]: { ...current[id], tier, customPrice: null },
    }));
  }

  function handlePriceChange(id: string, price: number | null) {
    setSelections((current) => ({
      ...current,
      [id]: { ...current[id], customPrice: price },
    }));
  }

  function handleToggleOwned(id: string) {
    setSelections((current) => ({
      ...current,
      [id]: { ...current[id], owned: !current[id].owned },
    }));
  }

  function handleRemove(id: string) {
    setRemoved((current) => new Set(current).add(id));
  }

  function handleRestoreAll() {
    setRemoved(new Set());
  }

  // ----- Derived data (recomputed whenever state changes) -----

  // Categories with removed items filtered out, and now-empty categories
  // dropped entirely.
  const visibleCategories = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          items: category.items.filter((item) => !removed.has(item.id)),
        }))
        .filter((category) => category.items.length > 0),
    [categories, removed]
  );

  const visibleItems = useMemo(
    () => visibleCategories.flatMap((category) => category.items),
    [visibleCategories]
  );

  const estimatedTotal = visibleItems.reduce((sum, item) => {
    const selection = selections[item.id];
    return selection ? sum + effectivePrice(item, selection) : sum;
  }, 0);

  const ownedCount = visibleItems.filter(
    (item) => selections[item.id]?.owned
  ).length;

  const removedCount = removed.size;

  // Display-ready data for the export functions.
  const exportCategories: ExportCategory[] = useMemo(
    () =>
      visibleCategories.map((category) => ({
        name: category.name,
        items: category.items.map((item) => {
          const selection = selections[item.id];
          return {
            name: item.name,
            tierLabel: priceTierLabel(selection.tier),
            price: effectivePrice(item, selection),
            owned: selection.owned,
          };
        }),
      })),
    [visibleCategories, selections]
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          &larr; Edit answers
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Your dorm checklist
        </h1>
        <p className="mt-2 text-slate-600">
          Personalized for <span className="font-medium">{answers.school}</span>{" "}
          - {climateLabel(answers.climate)}, {dormLabel(answers.dormType)}.
        </p>
      </div>

      {/* Summary + exports */}
      <div className="mb-8 space-y-4">
        <CostSummary
          estimatedTotal={estimatedTotal}
          budget={answers.budget}
          itemCount={visibleItems.length}
          ownedCount={ownedCount}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          {removedCount > 0 ? (
            <button
              type="button"
              onClick={handleRestoreAll}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              Restore {removedCount} removed item
              {removedCount === 1 ? "" : "s"}
            </button>
          ) : (
            <span />
          )}
          <ExportButtons
            answers={answers}
            categories={exportCategories}
            estimatedTotal={estimatedTotal}
          />
        </div>
      </div>

      {/* Category cards */}
      {visibleItems.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          You&apos;ve removed every item.{" "}
          <button
            type="button"
            onClick={handleRestoreAll}
            className="font-medium text-indigo-600 hover:underline"
          >
            Restore them
          </button>{" "}
          to start over.
        </p>
      ) : (
        <div className="space-y-6">
          {visibleCategories.map((category) => (
            <ChecklistCategorySection
              key={category.name}
              category={category}
              selections={selections}
              onTierChange={handleTierChange}
              onPriceChange={handlePriceChange}
              onToggleOwned={handleToggleOwned}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
