// Shared dropdown / chip option lists.
//
// Both the onboarding form (which renders the inputs) and the checklist page
// (which shows a human-friendly summary of the answers) need the same
// value-to-label mapping. Defining it once here keeps them in sync.

import type { Climate, DormType, Hobby } from "./types";

// A small reusable shape: the stored `value` plus the text we show the user.
export interface Option<T extends string> {
  value: T;
  label: string;
}

export const CLIMATE_OPTIONS: Option<Climate>[] = [
  { value: "hot", label: "Hot year-round" },
  { value: "cold", label: "Cold year-round" },
  { value: "four-season", label: "Four-season climate" },
  { value: "variable", label: "Variable climate" },
];

export const DORM_OPTIONS: Option<DormType>[] = [
  { value: "traditional-double", label: "Traditional double" },
  { value: "traditional-single", label: "Traditional single" },
  { value: "suite", label: "Suite-style" },
  { value: "apartment", label: "Apartment-style" },
  { value: "off-campus", label: "Off-campus housing" },
];

export const HOBBY_OPTIONS: Option<Hobby>[] = [
  { value: "fitness", label: "Fitness" },
  { value: "gaming", label: "Gaming" },
  { value: "cooking", label: "Cooking" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" },
  { value: "reading", label: "Reading" },
  { value: "sports", label: "Sports" },
  { value: "coffee", label: "Coffee" },
];

// Look up the friendly label for a stored value. Falls back to the raw value
// so the UI never shows a blank.
function labelFor<T extends string>(options: Option<T>[], value: T): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export const climateLabel = (value: Climate) => labelFor(CLIMATE_OPTIONS, value);
export const dormLabel = (value: DormType) => labelFor(DORM_OPTIONS, value);
export const hobbyLabel = (value: Hobby) => labelFor(HOBBY_OPTIONS, value);
