// Budget + pricing helpers.
//
// This module is the single source of truth for:
//   - the slider's bounds and default
//   - the budget tier labels (Essentials, Premium, ...)
//   - how we turn one "base" price into four tier prices
//   - which tier we preselect for a given budget
//
// Keeping the numbers here (instead of scattered across components) makes the
// rules easy to read and tweak.

import type {
  Budget,
  ChecklistItem,
  ItemSelection,
  PriceTier,
  PriceTiers,
} from "./types";

// Slider configuration. The slider runs from MIN to MAX; anything at MAX is
// displayed as "$2000+".
export const BUDGET_MIN = 100;
export const BUDGET_MAX = 2000;
export const BUDGET_STEP = 50;
export const BUDGET_DEFAULT = 800;

// Keep a number inside the slider's allowed range.
export function clampBudget(value: number): number {
  if (Number.isNaN(value)) return BUDGET_DEFAULT;
  return Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round(value)));
}

// Format a dollar amount the way the UI shows it. At the very top of the
// range we show "$2000+" instead of an exact number.
export function formatBudget(value: number): string {
  if (value >= BUDGET_MAX) return `$${BUDGET_MAX}+`;
  return `$${value.toLocaleString()}`;
}

// The five budget tiers, in order, with the lowest dollar amount that lands
// a student in each one. We read this list from the bottom up.
const BUDGET_TIERS: { min: number; label: string }[] = [
  { min: 2000, label: "Premium" },
  { min: 1300, label: "Comfortable" },
  { min: 800, label: "Typical Freshman" },
  { min: 400, label: "Budget-Conscious" },
  { min: 0, label: "Essentials" },
];

// Turn a dollar amount into its tier label (e.g. 850 -> "Typical Freshman").
export function budgetTierLabel(value: number): string {
  return BUDGET_TIERS.find((tier) => value >= tier.min)?.label ?? "Essentials";
}

// ----- Per-item price tiers -----

// The four tiers in display order, with a friendly label for each.
export const PRICE_TIER_OPTIONS: { value: PriceTier; label: string }[] = [
  { value: "bare", label: "Bare minimum" },
  { value: "standard", label: "Standard" },
  { value: "comfortable", label: "Comfortable" },
  { value: "premium", label: "Premium" },
];

export function priceTierLabel(tier: PriceTier): string {
  return PRICE_TIER_OPTIONS.find((t) => t.value === tier)?.label ?? tier;
}

// Round to the nearest $5 so generated prices look tidy (never below $5).
function roundPrice(value: number): number {
  return Math.max(5, Math.round(value / 5) * 5);
}

// Build the four tier prices from a single "standard" base price. The
// multipliers give a sensible spread: a cheap version, the standard one, a
// nicer one, and a premium splurge.
export function deriveTiers(standard: number): PriceTiers {
  return {
    bare: roundPrice(standard * 0.6),
    standard,
    comfortable: roundPrice(standard * 1.5),
    premium: roundPrice(standard * 2.5),
  };
}

// Pick the tier we preselect for an item based on the student's budget.
// A bigger budget starts everyone at a nicer default tier. When the budget
// is unknown we fall back to "standard" (a reasonable middle ground).
export function defaultTierForBudget(budget: Budget): PriceTier {
  if (budget === "unknown") return "standard";
  if (budget >= 2000) return "premium";
  if (budget >= 1300) return "comfortable";
  if (budget >= 400) return "standard";
  return "bare"; // Essentials ($100-399)
}

// The dollar amount one item contributes to the total right now:
//   - $0 if the student already owns it
//   - their custom price if they typed one
//   - otherwise the price of the selected tier
export function effectivePrice(
  item: ChecklistItem,
  selection: ItemSelection
): number {
  if (selection.owned) return 0;
  return selection.customPrice ?? item.prices[selection.tier];
}
