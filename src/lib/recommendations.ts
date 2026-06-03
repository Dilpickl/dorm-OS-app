// Recommendation engine — filters, scores, and ranks catalog products.

import type { CatalogProduct } from "./catalog/types";
import { CATALOG_TIER_OVERRIDES } from "./catalog/priceOverrides";
import { deriveTiers, defaultTierForBudget } from "./budget";
import type {
  ChecklistCategory,
  ChecklistItem,
  DormType,
  OnboardingAnswers,
} from "./types";

const TRADITIONAL_DORMS: DormType[] = [
  "traditional-double",
  "traditional-single",
];
const KITCHEN_DORMS: DormType[] = ["suite", "apartment", "off-campus"];

// ----- Hard filters (product is excluded if any rule fails) -----

function passesHardFilters(
  product: CatalogProduct,
  answers: OnboardingAnswers
): boolean {
  if (product.climates && !product.climates.includes(answers.climate)) {
    return false;
  }
  if (product.dormTypes && !product.dormTypes.includes(answers.dormType)) {
    return false;
  }
  if (product.hobby && !answers.hobbies.includes(product.hobby)) {
    return false;
  }
  return true;
}

// ----- Soft scoring (higher = more relevant, sort within category) -----

function scoreProduct(
  product: CatalogProduct,
  answers: OnboardingAnswers
): number {
  let score = product.priority ?? 50;

  if (product.essential) score += 40;

  if (product.climates?.includes(answers.climate)) score += 15;
  if (product.dormTypes?.includes(answers.dormType)) score += 12;
  if (product.hobby && answers.hobbies.includes(product.hobby)) score += 20;

  // Traditional halls: emphasize storage & shared-bath essentials.
  if (TRADITIONAL_DORMS.includes(answers.dormType)) {
    if (product.category === "Storage") score += 18;
    if (product.category === "Bathroom") score += 10;
    if (product.category === "Kitchen" && !product.essential) score -= 15;
  }

  // Suite / apartment / off-campus: boost kitchen setup.
  if (KITCHEN_DORMS.includes(answers.dormType) && product.category === "Kitchen") {
    score += 16;
  }

  if (answers.dormType === "off-campus") {
    if (product.category === "Kitchen") score += 10;
    if (product.id === "cookware") score += 12;
  }

  // Variable climate: slight boost for items tagged for multiple climates.
  if (answers.climate === "variable" && product.climates && product.climates.length >= 2) {
    score += 8;
  }

  // Four-season: boost both heating and cooling accessories slightly.
  if (answers.climate === "four-season") {
    if (product.id === "fan" || product.id === "space-heater") score += 6;
  }

  // More hobbies selected → hobby gear is more valuable.
  if (product.hobby && answers.hobbies.length >= 2) {
    score += 5;
  }

  return score;
}

function toChecklistItem(
  product: CatalogProduct,
  answers: OnboardingAnswers
): ChecklistItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    prices:
      CATALOG_TIER_OVERRIDES[product.id] ?? deriveTiers(product.basePrice),
    defaultTier: defaultTierForBudget(answers.budget),
    link: product.link,
  };
}

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

export function generateChecklist(
  answers: OnboardingAnswers,
  catalog: CatalogProduct[]
): ChecklistCategory[] {
  const scored = catalog
    .filter((product) => passesHardFilters(product, answers))
    .map((product) => ({
      product,
      score: scoreProduct(product, answers),
    }))
    .sort((a, b) => b.score - a.score);

  const groups = new Map<string, ChecklistItem[]>();
  for (const { product } of scored) {
    const items = groups.get(product.category) ?? [];
    items.push(toChecklistItem(product, answers));
    groups.set(product.category, items);
  }

  const categoryNames = Array.from(groups.keys());
  categoryNames.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    const rankA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const rankB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b);
  });

  return categoryNames.map((name) => ({
    name,
    items: groups.get(name) ?? [],
  }));
}
