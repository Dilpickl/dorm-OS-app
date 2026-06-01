// Shared TypeScript types for the whole app.
// Keeping every type in one file makes it easy for beginners to see the
// "shape" of the data that flows between the form, the recommendation
// engine, and the UI components.

// The climate where the school is located. This affects which items make
// sense (for example, a heated blanket for a cold-year-round school).
export type Climate = "hot" | "cold" | "four-season" | "variable";

// The kind of dorm a student will live in. This affects which items make
// sense (for example, an apartment usually has a kitchen).
export type DormType =
  | "traditional-double"
  | "traditional-single"
  | "suite"
  | "apartment"
  | "off-campus";

// Hobbies let us add fun, personalized categories to the checklist.
export type Hobby =
  | "fitness"
  | "gaming"
  | "cooking"
  | "music"
  | "art"
  | "reading"
  | "sports"
  | "coffee";

// The four price levels every item supports. The student can switch any
// item between these tiers, or type their own custom price.
export type PriceTier = "bare" | "standard" | "comfortable" | "premium";

// The price of one item at each of the four tiers (whole US dollars).
export interface PriceTiers {
  bare: number;
  standard: number;
  comfortable: number;
  premium: number;
}

// The budget the student gives us during onboarding. It is either a dollar
// amount (from the slider) or "unknown" when they pick "I don't know" and
// ask us to estimate it from the generated list instead.
export type Budget = number | "unknown";

// Everything we collect from the onboarding form.
// `school` is free text; the rest are constrained to known options.
export interface OnboardingAnswers {
  school: string;
  climate: Climate;
  budget: Budget;
  dormType: DormType;
  hobbies: Hobby[];
}

// A single product the student might buy for their dorm.
export interface ChecklistItem {
  id: string;
  name: string;
  category: string;
  prices: PriceTiers; // price at each tier
  defaultTier: PriceTier; // which tier we preselect (based on their budget)
  link: string; // a (mock) URL where the item could be bought
}

// A group of related items, e.g. "Bedding" or "Kitchen".
export interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

// The student's live choices for one item on the checklist page:
//   - which price tier is selected
//   - an optional custom price that overrides the tier price (null = none)
//   - whether they already own it (which removes it from the total)
export interface ItemSelection {
  tier: PriceTier;
  customPrice: number | null;
  owned: boolean;
}
