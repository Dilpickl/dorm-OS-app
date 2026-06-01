// Helpers for moving the onboarding answers through the URL.
//
// Because we use two routes (home -> /checklist) and intentionally do NOT
// persist anything, we pass the answers as query-string parameters. These
// two functions keep that logic in one place so the form and the checklist
// page always agree on the format.

import { clampBudget } from "./budget";
import { CLIMATE_OPTIONS, DORM_OPTIONS, HOBBY_OPTIONS } from "./options";
import type {
  Budget,
  Climate,
  DormType,
  Hobby,
  OnboardingAnswers,
} from "./types";

// Valid values, derived from the shared option lists so there is one source
// of truth.
const CLIMATES = CLIMATE_OPTIONS.map((o) => o.value);
const DORM_TYPES = DORM_OPTIONS.map((o) => o.value);
const HOBBIES = HOBBY_OPTIONS.map((o) => o.value);

// Turn the answers into a query string like:
//   school=UCLA&climate=hot&budget=800&dormType=suite&hobbies=gaming,coffee
// The budget is either a number or the literal word "unknown".
export function answersToQuery(answers: OnboardingAnswers): string {
  const params = new URLSearchParams();
  params.set("school", answers.school);
  params.set("climate", answers.climate);
  params.set("budget", String(answers.budget));
  params.set("dormType", answers.dormType);
  params.set("hobbies", answers.hobbies.join(","));
  return params.toString();
}

// The shape Next.js gives us for searchParams: each key is a string,
// a string array, or undefined.
type RawSearchParams = Record<string, string | string[] | undefined>;

// Read the first value for a key (searchParams can be arrays).
function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

// Parse the budget param into either "unknown" or a clamped dollar amount.
function parseBudget(raw: string): Budget {
  if (raw === "unknown") return "unknown";
  const value = Number(raw);
  return Number.isFinite(value) ? clampBudget(value) : "unknown";
}

// Turn raw URL params back into typed OnboardingAnswers.
// Returns `null` if the required answers are missing or invalid, so the
// checklist page can show a friendly "fill out the form" message.
export function parseAnswers(raw: RawSearchParams): OnboardingAnswers | null {
  const school = first(raw.school).trim();
  const climate = first(raw.climate) as Climate;
  const dormType = first(raw.dormType) as DormType;

  // Validate the constrained fields. (Budget always resolves, so it can't
  // make the answers invalid on its own.)
  if (!CLIMATES.includes(climate)) return null;
  if (!DORM_TYPES.includes(dormType)) return null;

  // Hobbies are optional. Split the comma list and keep only valid ones.
  const hobbies = first(raw.hobbies)
    .split(",")
    .map((h) => h.trim())
    .filter((h): h is Hobby => HOBBIES.includes(h as Hobby));

  return {
    school: school || "your school",
    climate,
    budget: parseBudget(first(raw.budget)),
    dormType,
    hobbies,
  };
}
