"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { effectivePrice, priceTierLabel } from "@/lib/budget";
import { climateLabel, dormLabel } from "@/lib/options";
import {
  clearPersistedChecklist,
  formatRelativeSavedTime,
  loadPersistedChecklist,
  savePersistedChecklist,
} from "@/lib/storage/checklistPersistence";
import type { CatalogSource } from "@/lib/catalog/getCatalog";
import type {
  ChecklistCategory,
  ChecklistItem,
  ItemSelection,
  OnboardingAnswers,
  PriceTier,
} from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { cn } from "@/lib/cn";
import ChecklistCategorySection from "./ChecklistCategorySection";
import CostSummary from "./CostSummary";
import ExportButtons, { type ExportCategory } from "./ExportButtons";

const CATEGORY_TINTS = [
  "accent",
  "secondary",
  "tertiary",
  "quaternary",
] as const;

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
  const [undoToast, setUndoToast] = useState<{ id: string; name: string } | null>(
    null
  );
  const [, setRelativeTick] = useState(0);
  const hydrated = useRef(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemById = useMemo(() => {
    const map = new Map<string, ChecklistItem>();
    for (const category of categories) {
      for (const item of category.items) {
        map.set(item.id, item);
      }
    }
    return map;
  }, [categories]);

  const removedItems = useMemo(
    () =>
      Array.from(removed)
        .map((id) => {
          const item = itemById.get(id);
          return item ? { id, name: item.name } : null;
        })
        .filter((entry): entry is { id: string; name: string } => entry !== null)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [removed, itemById]
  );

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

  useEffect(() => {
    if (!hydrated.current) return;

    const timer = window.setTimeout(() => {
      void savePersistedChecklist(answers, selections, removed).then(
        setLastSavedAt
      );
    }, 400);

    return () => window.clearTimeout(timer);
  }, [answers, selections, removed]);

  useEffect(() => {
    if (lastSavedAt === null) return;
    const id = window.setInterval(() => setRelativeTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, [lastSavedAt]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

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

  function showUndoToast(id: string, name: string) {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoToast({ id, name });
    undoTimerRef.current = setTimeout(() => setUndoToast(null), 8000);
  }

  function handleRemove(id: string) {
    const item = itemById.get(id);
    setRemoved((current) => new Set(current).add(id));
    if (item) showUndoToast(id, item.name);
  }

  function handleRestoreOne(id: string) {
    setRemoved((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    if (undoToast?.id === id) {
      setUndoToast(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  }

  function handleRestoreAll() {
    setRemoved(new Set());
    setUndoToast(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }

  function handleClearSaved() {
    void clearPersistedChecklist(answers).then(() => {
      setSelections(buildInitialSelections(categories));
      setRemoved(new Set());
      setLastSavedAt(null);
      setUndoToast(null);
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
    <div className="relative mx-auto max-w-3xl px-6 py-12">
      <SceneDecor />
      <div className="relative mb-8 animate-pop-in">
        <Link
          href="/"
          className="font-body text-sm font-semibold text-accent hover:underline"
        >
          &larr; Edit answers
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Your dorm checklist
        </h1>
        <p className="mt-2 font-body text-muted-foreground">
          Personalized for{" "}
          <span className="font-semibold text-foreground">{answers.school}</span>{" "}
          · {climateLabel(answers.climate)}, {dormLabel(answers.dormType)}.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="muted">
            Catalog:{" "}
            {catalogSource === "supabase"
              ? "Supabase"
              : catalogSource === "api"
                ? "live API"
                : "built-in mock"}
          </Badge>
          {lastSavedAt !== null && (
            <Badge variant="saved">
              All changes saved · {formatRelativeSavedTime(lastSavedAt)}
            </Badge>
          )}
          <button
            type="button"
            onClick={handleClearSaved}
            className="font-body text-xs font-medium text-muted-foreground underline-offset-2 hover:text-secondary hover:underline"
          >
            Reset saved progress
          </button>
        </div>
      </div>

      {removedItems.length > 0 && (
        <Panel
          className="relative mb-6 p-4"
          aria-label="Removed items"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-sm font-bold text-foreground">
              Removed items ({removedItems.length})
            </h2>
            {removedItems.length > 1 && (
              <button
                type="button"
                onClick={handleRestoreAll}
                className="font-body text-xs font-semibold text-accent hover:underline"
              >
                Restore all
              </button>
            )}
          </div>
          <ul className="mt-3 space-y-2">
            {removedItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border-2 border-border bg-muted/60 px-3 py-2"
              >
                <span className="font-body text-sm text-foreground">
                  {item.name}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-9 px-3 py-1 text-xs"
                  onClick={() => handleRestoreOne(item.id)}
                >
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="mb-8 space-y-4">
        <CostSummary
          estimatedTotal={estimatedTotal}
          budget={answers.budget}
          itemCount={visibleItems.length}
          ownedCount={ownedCount}
        />
        <div className="flex flex-wrap items-center justify-end gap-3">
          <ExportButtons
            answers={answers}
            categories={exportCategories}
            estimatedTotal={estimatedTotal}
          />
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <Panel className="p-8 text-center">
          <p className="font-body text-muted-foreground">
            You&apos;ve removed every item.{" "}
            <button
              type="button"
              onClick={handleRestoreAll}
              className="font-semibold text-accent hover:underline"
            >
              Restore them
            </button>{" "}
            to start over.
          </p>
        </Panel>
      ) : (
        <div className="space-y-6">
          {visibleCategories.map((category, index) => (
            <ChecklistCategorySection
              key={category.name}
              category={category}
              selections={selections}
              onTierChange={handleTierChange}
              onPriceChange={handlePriceChange}
              onToggleOwned={handleToggleOwned}
              onRemove={handleRemove}
              headerTint={CATEGORY_TINTS[index % CATEGORY_TINTS.length]}
            />
          ))}
        </div>
      )}

      {undoToast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center gap-3 rounded-full border-2 border-foreground bg-accent px-5 py-3 font-body text-sm font-semibold text-accent-foreground shadow-pop-lg animate-pop-in"
          )}
          role="status"
        >
          <span>
            Removed <span className="font-bold">{undoToast.name}</span>
          </span>
          <button
            type="button"
            onClick={() => handleRestoreOne(undoToast.id)}
            className="rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-bold text-foreground transition hover:bg-tertiary"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
