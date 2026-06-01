// The recommendation engine.
//
// This file takes the student's onboarding answers and turns the flat list
// of mock products into a set of checklist categories tailored to them.
//
// It is intentionally written as plain, well-commented functions so it is
// easy to read and to extend later (this is the one place you'd plug in a
// real recommendation API).

import { deriveTiers, defaultTierForBudget } from "./budget";
import { mockProducts, type MockProduct } from "./mockData";
import type {
  ChecklistCategory,
  ChecklistItem,
  OnboardingAnswers,
} from "./types";

// Decide whether a single product should be recommended for these answers.
// Each `if` below is one rule. If any rule fails, the product is skipped.
//
// Note: budget no longer filters items. Instead, every relevant item is shown
// and the student controls cost through per-item price tiers, the "already
// own" toggle, and removing items on the checklist page.
function shouldRecommend(product: MockProduct, answers: OnboardingAnswers): boolean {
  // Rule 1: Climate. If the item is climate-specific, the student's climate
  // must be in its list.
  if (product.climates && !product.climates.includes(answers.climate)) {
    return false;
  }

  // Rule 2: Dorm type. If the item is dorm-type-specific, it must match.
  if (product.dormTypes && !product.dormTypes.includes(answers.dormType)) {
    return false;
  }

  // Rule 3: Hobby. Hobby items only appear if the student picked that hobby.
  if (product.hobby && !answers.hobbies.includes(product.hobby)) {
    return false;
  }

  // Passed every rule, so recommend it.
  return true;
}

// Convert a MockProduct (which has a base price + tags) into a ChecklistItem
// (with the full set of tier prices and a preselected default tier).
function toChecklistItem(
  product: MockProduct,
  answers: OnboardingAnswers
): ChecklistItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    prices: deriveTiers(product.basePrice),
    defaultTier: defaultTierForBudget(answers.budget),
    link: product.link,
  };
}

// The order categories appear in on the page. Anything not listed here
// (e.g. hobby categories) is appended afterwards in the order discovered.
const CATEGORY_ORDER = [
  "Bedding",
  "Bathroom",
  "Storage",
  "Electronics",
  "Study",
  "Laundry & Cleaning",
  "Kitchen",
  "Decor",
];

// Main entry point: turn answers into an ordered list of categories.
export function generateChecklist(answers: OnboardingAnswers): ChecklistCategory[] {
  // 1) Keep only the products that match the student's answers.
  const recommended = mockProducts.filter((product) =>
    shouldRecommend(product, answers)
  );

  // 2) Group the surviving products by their category name.
  const groups = new Map<string, ChecklistItem[]>();
  for (const product of recommended) {
    const items = groups.get(product.category) ?? [];
    items.push(toChecklistItem(product, answers));
    groups.set(product.category, items);
  }

  // 3) Sort the category names: known categories first (in CATEGORY_ORDER),
  //    then any remaining categories (like hobbies) alphabetically.
  const categoryNames = Array.from(groups.keys());
  categoryNames.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    const rankA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const rankB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b);
  });

  // 4) Build the final array of categories.
  return categoryNames.map((name) => ({
    name,
    items: groups.get(name) ?? [],
  }));
}
