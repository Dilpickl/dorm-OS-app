"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
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
import {
  fieldClass,
  labelClass,
  priceInputClass,
  selectClass,
} from "@/lib/design/forms";
import ChecklistCategorySection from "./ChecklistCategorySection";
import CostSummary from "./CostSummary";
import ExportButtons, { type ExportCategory } from "./ExportButtons";
import ChecklistTutorial from "./ChecklistTutorial";

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

/** Place custom items into matching checklist sections (case-insensitive name). */
function mergeCustomIntoCategories(
  base: ChecklistCategory[],
  custom: ChecklistItem[]
): ChecklistCategory[] {
  if (custom.length === 0) return base;

  const itemsByCategory = new Map<string, ChecklistItem[]>();
  for (const cat of base) {
    itemsByCategory.set(cat.name, [...cat.items]);
  }

  for (const item of custom) {
    const raw = item.category.trim() || "Custom Items";
    const existingKey =
      [...itemsByCategory.keys()].find(
        (key) => key.toLowerCase() === raw.toLowerCase()
      ) ?? raw;
    const bucket = itemsByCategory.get(existingKey) ?? [];
    itemsByCategory.set(existingKey, [
      ...bucket,
      existingKey === raw ? item : { ...item, category: existingKey },
    ]);
  }

  const known = new Set(base.map((cat) => cat.name));
  const merged: ChecklistCategory[] = base.map((cat) => ({
    name: cat.name,
    items: itemsByCategory.get(cat.name) ?? cat.items,
  }));

  for (const [name, items] of itemsByCategory) {
    if (!known.has(name)) {
      merged.push({ name, items });
    }
  }

  return merged;
}

function collectCategoryNames(
  base: ChecklistCategory[],
  custom: ChecklistItem[]
): string[] {
  const names = new Set<string>();
  for (const cat of base) names.add(cat.name);
  for (const item of custom) {
    const label = item.category.trim();
    if (label) names.add(label);
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

const CUSTOM_CATEGORY_CHOICE = "__custom__";

export default function ChecklistView({
  answers,
  categories,
}: ChecklistViewProps) {
  const [selections, setSelections] = useState<Record<string, ItemSelection>>(
    () => buildInitialSelections(categories)
  );
  const [customItems, setCustomItems] = useState<ChecklistItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [categoryChoice, setCategoryChoice] = useState(
    () => categories[0]?.name ?? CUSTOM_CATEGORY_CHOICE
  );
  const [newItemCustomCategoryName, setNewItemCustomCategoryName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("25");
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [undoToast, setUndoToast] = useState<{ id: string; name: string } | null>(
    null
  );
  const [removedPanelOpen, setRemovedPanelOpen] = useState(false);
  const [, setRelativeTick] = useState(0);
  const hydrated = useRef(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checklistSectionRef = useRef<HTMLDivElement>(null);

  const listCategoryOptions = useMemo(
    () =>
      collectCategoryNames(categories, customItems).filter(
        (name) => name.toLowerCase() !== "custom items"
      ),
    [categories, customItems]
  );

  const usingCustomCategory = categoryChoice === CUSTOM_CATEGORY_CHOICE;

  const allCategories = useMemo(
    () => mergeCustomIntoCategories(categories, customItems),
    [categories, customItems]
  );

  const itemById = useMemo(() => {
    const map = new Map<string, ChecklistItem>();
    for (const category of allCategories) {
      for (const item of category.items) {
        map.set(item.id, item);
      }
    }
    return map;
  }, [allCategories]);

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
        const hydratedCategories = mergeCustomIntoCategories(
          categories,
          saved.customItems
        );
        setCustomItems(saved.customItems);
        setSelections(mergeSelections(hydratedCategories, saved.selections));
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
      void savePersistedChecklist(
        answers,
        selections,
        removed,
        customItems
      ).then(setLastSavedAt);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [answers, selections, removed, customItems]);

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

  function handleAddCustomItem(event: React.FormEvent) {
    event.preventDefault();

    const name = newItemName.trim();
    if (!name) return;

    const price = Math.max(0, Math.round(Number(newItemPrice) || 0));
    const category = usingCustomCategory
      ? newItemCustomCategoryName.trim() || "Custom"
      : categoryChoice;

    if (usingCustomCategory && !newItemCustomCategoryName.trim()) return;
    const id = `custom-${Date.now()}-${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;
    const item: ChecklistItem = {
      id,
      name,
      category,
      prices: {
        bare: price,
        standard: price,
        comfortable: price,
        premium: price,
      },
      defaultTier: "standard",
      link: "#",
    };

    setCustomItems((current) => [...current, item]);
    setSelections((current) => ({
      ...current,
      [id]: {
        tier: "standard",
        customPrice: null,
        owned: false,
      },
    }));
    setRemoved((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setNewItemName("");
    setNewItemPrice("25");
    setCategoryChoice(listCategoryOptions[0] ?? CUSTOM_CATEGORY_CHOICE);
    setNewItemCustomCategoryName("");
    setShowAddItem(false);
  }

  function handleClearSaved() {
    void clearPersistedChecklist(answers).then(() => {
      setSelections(buildInitialSelections(categories));
      setCustomItems([]);
      setRemoved(new Set());
      setLastSavedAt(null);
      setUndoToast(null);
    });
  }

  const visibleCategories = useMemo(
    () =>
      allCategories
        .map((category) => ({
          ...category,
          items: category.items.filter((item) => !removed.has(item.id)),
        }))
        .filter((category) => category.items.length > 0),
    [allCategories, removed]
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
            link: item.link !== "#" ? item.link : null,
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
          {lastSavedAt !== null && (
            <Badge variant="saved">
              All changes saved locally · {formatRelativeSavedTime(lastSavedAt)}
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

      <Panel className="mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Add your own item
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Add anything missing from the generated list.
            </p>
          </div>
          <Button
            type="button"
            variant={showAddItem ? "secondary" : "primary"}
            className="min-h-10 px-4 py-2 text-sm"
            data-tutorial-target="add-item-button"
            onClick={() => setShowAddItem((open) => !open)}
          >
            {showAddItem ? "Cancel" : "Add item"}
          </Button>
        </div>

        {showAddItem && (
          <form
            onSubmit={handleAddCustomItem}
            className="mt-4 grid gap-3 sm:grid-cols-[1fr_11rem_7rem_auto] sm:items-end"
          >
            <div>
              <label htmlFor="custom-item-name" className={labelClass}>
                Item
              </label>
              <input
                id="custom-item-name"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                placeholder="e.g. Desk lamp"
                className={fieldClass}
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor={
                    usingCustomCategory
                      ? "custom-item-category-name"
                      : "custom-item-category"
                  }
                  className={labelClass}
                >
                  Category
                </label>
                {usingCustomCategory && (
                  <button
                    type="button"
                    onClick={() =>
                      setCategoryChoice(
                        listCategoryOptions[0] ?? CUSTOM_CATEGORY_CHOICE
                      )
                    }
                    className="font-body text-[11px] font-semibold text-accent hover:underline"
                  >
                    From list
                  </button>
                )}
              </div>
              {usingCustomCategory ? (
                <input
                  id="custom-item-category-name"
                  value={newItemCustomCategoryName}
                  onChange={(event) =>
                    setNewItemCustomCategoryName(event.target.value)
                  }
                  placeholder="New category name"
                  className={fieldClass}
                />
              ) : (
                <select
                  id="custom-item-category"
                  value={categoryChoice}
                  onChange={(event) =>
                    setCategoryChoice(event.target.value)
                  }
                  className={selectClass}
                >
                  {listCategoryOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value={CUSTOM_CATEGORY_CHOICE}>Custom</option>
                </select>
              )}
            </div>
            <div>
              <label htmlFor="custom-item-price" className={labelClass}>
                Price
              </label>
              <input
                id="custom-item-price"
                type="number"
                min={0}
                value={newItemPrice}
                onChange={(event) => setNewItemPrice(event.target.value)}
                className={cn(priceInputClass, "mt-2")}
              />
            </div>
            <Button type="submit" className="min-h-11 px-4 py-2 text-sm">
              Add
            </Button>
          </form>
        )}
      </Panel>

      {removedItems.length > 0 && (
        <Panel className="relative mb-6 overflow-hidden">
          <div className="flex items-center border-b-2 border-foreground/10">
            <button
              type="button"
              onClick={() => setRemovedPanelOpen((open) => !open)}
              className="flex min-h-12 flex-1 items-center gap-2 px-4 py-3 text-left transition hover:bg-muted/50"
              aria-expanded={removedPanelOpen}
              aria-controls="removed-items-list"
            >
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-foreground transition-transform duration-300 ease-bounce",
                  removedPanelOpen && "rotate-180"
                )}
                strokeWidth={2.5}
                aria-hidden
              />
              <span className="font-heading text-sm font-bold text-foreground">
                Removed items ({removedItems.length})
              </span>
            </button>
            {removedPanelOpen && removedItems.length > 1 && (
              <button
                type="button"
                onClick={handleRestoreAll}
                className="mr-4 shrink-0 font-body text-xs font-semibold text-accent hover:underline"
              >
                Restore all
              </button>
            )}
          </div>
          {removedPanelOpen && (
            <ul
              id="removed-items-list"
              className="space-y-2 p-4 pt-3"
            >
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
          )}
        </Panel>
      )}

      <div className="mb-8 space-y-4">
        <div data-tutorial-target="estimated-total">
          <CostSummary
            estimatedTotal={estimatedTotal}
            budget={answers.budget}
            itemCount={visibleItems.length}
            ownedCount={ownedCount}
          />
        </div>
        <div
          data-tutorial-target="export-buttons"
          className="flex flex-wrap items-center justify-end gap-3"
        >
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
        <div ref={checklistSectionRef} className="space-y-6">
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

      <ChecklistTutorial
        active={visibleItems.length > 0}
        checklistRef={checklistSectionRef}
      />

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

      <p className="mt-12 text-center font-body text-xs text-muted-foreground">
        As an Amazon Associate I earn from qualifying purchases.
      </p>
    </div>
  );
}
