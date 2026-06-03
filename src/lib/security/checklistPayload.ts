import { clampBudget } from "@/lib/budget";
import { CLIMATE_OPTIONS, DORM_OPTIONS, HOBBY_OPTIONS } from "@/lib/options";
import type {
  Budget,
  ChecklistItem,
  Climate,
  DormType,
  Hobby,
  ItemSelection,
  OnboardingAnswers,
  PriceTier,
} from "@/lib/types";
import {
  CATEGORY_MAX_LENGTH,
  ITEM_NAME_MAX_LENGTH,
  MAX_CUSTOM_ITEMS,
  MAX_REMOVED_IDS,
  MAX_SELECTION_ENTRIES,
  SCHOOL_MAX_LENGTH,
} from "./limits";
import { sanitizeItemLink } from "./urls";

const CLIMATES = CLIMATE_OPTIONS.map((o) => o.value);
const DORM_TYPES = DORM_OPTIONS.map((o) => o.value);
const HOBBIES = HOBBY_OPTIONS.map((o) => o.value);
const PRICE_TIERS: PriceTier[] = ["bare", "standard", "comfortable", "premium"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

export function normalizeSchool(school: string): string {
  const trimmed = school.trim();
  if (!trimmed) return "your school";
  return truncate(trimmed, SCHOOL_MAX_LENGTH);
}

function parseBudget(raw: unknown): Budget {
  if (raw === "unknown") return "unknown";
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? clampBudget(value) : "unknown";
}

export function parseOnboardingAnswers(raw: unknown): OnboardingAnswers | null {
  if (!isRecord(raw)) return null;

  const climate = raw.climate as Climate;
  const dormType = raw.dormType as DormType;
  if (!CLIMATES.includes(climate)) return null;
  if (!DORM_TYPES.includes(dormType)) return null;

  const hobbiesRaw = Array.isArray(raw.hobbies) ? raw.hobbies : [];
  const hobbies = hobbiesRaw
    .filter((h): h is string => typeof h === "string")
    .map((h) => h.trim())
    .filter((h): h is Hobby => HOBBIES.includes(h as Hobby));

  const school =
    typeof raw.school === "string" ? normalizeSchool(raw.school) : "your school";

  return {
    school,
    climate,
    budget: parseBudget(raw.budget),
    dormType,
    hobbies,
  };
}

function parsePriceTiers(raw: unknown): ChecklistItem["prices"] | null {
  if (!isRecord(raw)) return null;
  const tiers = {} as ChecklistItem["prices"];
  for (const tier of PRICE_TIERS) {
    const value = raw[tier];
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num) || num < 0) return null;
    tiers[tier] = Math.round(num);
  }
  return tiers;
}

export function parseCustomItems(raw: unknown): ChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  const items: ChecklistItem[] = [];

  for (const entry of raw.slice(0, MAX_CUSTOM_ITEMS)) {
    if (!isRecord(entry)) continue;
    const id = typeof entry.id === "string" ? entry.id.trim() : "";
    const name =
      typeof entry.name === "string"
        ? truncate(entry.name.trim(), ITEM_NAME_MAX_LENGTH)
        : "";
    const category =
      typeof entry.category === "string"
        ? truncate(entry.category.trim(), CATEGORY_MAX_LENGTH)
        : "";
    const prices = parsePriceTiers(entry.prices);
    const defaultTier = entry.defaultTier as PriceTier;
    const link =
      typeof entry.link === "string" ? sanitizeItemLink(entry.link) : "#";

    if (!id.startsWith("custom-") || !name || !category || !prices) continue;
    if (!PRICE_TIERS.includes(defaultTier)) continue;

    items.push({ id, name, category, prices, defaultTier, link });
  }

  return items;
}

function parseItemSelection(raw: unknown): ItemSelection | null {
  if (!isRecord(raw)) return null;
  const tier = raw.tier as PriceTier;
  if (!PRICE_TIERS.includes(tier)) return null;

  let customPrice: number | null = null;
  if (raw.customPrice !== null && raw.customPrice !== undefined) {
    const num =
      typeof raw.customPrice === "number"
        ? raw.customPrice
        : Number(raw.customPrice);
    if (!Number.isFinite(num) || num < 0) return null;
    customPrice = Math.round(num);
  }

  return {
    tier,
    customPrice,
    owned: raw.owned === true,
  };
}

export function parseSelections(
  raw: unknown
): Record<string, ItemSelection> | null {
  if (!isRecord(raw)) return null;

  const entries = Object.entries(raw).filter(
    ([key]) => key !== "__customItems"
  );
  if (entries.length > MAX_SELECTION_ENTRIES) return null;

  const selections: Record<string, ItemSelection> = {};
  for (const [id, value] of entries) {
    if (typeof id !== "string" || !id.trim()) continue;
    const parsed = parseItemSelection(value);
    if (!parsed) return null;
    selections[id] = parsed;
  }
  return selections;
}

export function parseRemovedIds(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_REMOVED_IDS) return null;
  const ids: string[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string" || !entry.trim()) return null;
    ids.push(entry.trim());
  }
  return ids;
}

export interface ValidatedChecklistPayload {
  answers: OnboardingAnswers;
  selections: Record<string, ItemSelection>;
  removed: string[];
  customItems: ChecklistItem[];
}

export function validateChecklistPayload(body: unknown): ValidatedChecklistPayload | null {
  if (!isRecord(body)) return null;

  const answers = parseOnboardingAnswers(body.answers);
  const selections = parseSelections(body.selections);
  const removed = parseRemovedIds(body.removed);
  if (!answers || !selections || !removed) return null;

  const customItems = parseCustomItems(body.customItems ?? []);

  return { answers, selections, removed, customItems };
}
