"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { effectivePrice, priceTierLabel } from "@/lib/budget";
import { climateLabel, dormLabel } from "@/lib/options";
import {
  clearPersistedChecklist,
  formatSavedTime,
  loadPersistedChecklist,
  savePersistedChecklist,
  usesCloudPersistence,
} from "@/lib/storage/checklistPersistence";
import type { CatalogSource } from "@/lib/catalog/getCatalog";
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
  catalogSource?: CatalogSource;
}

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

function mergeSelections(
  categories: ChecklistCategory[],
  saved: Record<string, ItemSelection>
): Record<string, ItemSelection> {
  const base = buildInitialSelections(categories);
  for (const category of categories) {
    for (const item of category.items) {
      const prior = saved[item.id];
      if (prior) {
        base[item.id] = {
          tier: prior.tier,
          customPrice: prior.customPrice,
          owned: prior.owned,
        };
      }
    }
  }
  return base;
}

export default function ChecklistView({
  answers,
  categories,
  catalogSource = "mock",
}: ChecklistViewProps) {
  const [selections, setSelections] = useState<Record<string, ItemSelection>>(
    () => buildInitialSelections(categories)
  );
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const hydrated = useRef(false);

  // Restore saved progress once on mount (Supabase or localStorage).
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const saved = await loadPersistedChecklist(answers);
      if (cancelled) return;
      if (saved) {
        setSelections(mergeSelections(categories, saved.selections));
        setRemoved(new Set(saved.removed));
        setLastSavedAt(saved.updatedAt);
      }
      hydrated.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [answers, categories]);

  // Auto-save after hydration when selections or removed change.
  useEffect(() => {
    if (!hydrated.current) return;

    const timer = window.setTimeout(() => {
      void savePersistedChecklist(answers, selections, removed).then(
        setLastSavedAt
      );
    }, 400);

    return () => window.clearTimeout(timer);
  }, [answers, selections, removed]);

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

  function handleClearSaved() {
    void clearPersistedChecklist(answers).then(() => {
      setSelections(buildInitialSelections(categories));
      setRemoved(new Set());
      setLastSavedAt(null);
    });
  }

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
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            Catalog:{" "}
            {catalogSource === "supabase"
              ? "Supabase"
              : catalogSource === "api"
                ? "live API"
                : "built-in mock"}
          </span>
          {lastSavedAt !== null && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800">
              Saved {usesCloudPersistence() ? "to Supabase" : "locally"} ·{" "}
              {formatSavedTime(lastSavedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={handleClearSaved}
            className="text-slate-400 underline-offset-2 hover:text-red-600 hover:underline"
          >
            Reset saved progress
          </button>
        </div>
      </div>

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
