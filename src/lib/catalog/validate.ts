// Validates and normalizes raw JSON from an external catalog API.

import type { Climate, DormType, Hobby } from "../types";
import type { CatalogProduct } from "./types";

const CLIMATES: Climate[] = ["hot", "cold", "four-season"];
const DORM_TYPES: DormType[] = [
  "traditional-double",
  "traditional-single",
  "suite",
  "apartment",
  "off-campus",
];
const HOBBIES: Hobby[] = [
  "fitness",
  "gaming",
  "cooking",
  "music",
  "art",
  "reading",
  "sports",
  "coffee",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringArray(
  value: unknown,
  allowed: readonly string[]
): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const filtered = value.filter(
    (v): v is string => typeof v === "string" && allowed.includes(v)
  );
  return filtered.length > 0 ? filtered : undefined;
}

function parseOneProduct(raw: unknown): CatalogProduct | null {
  if (!isRecord(raw)) return null;

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  const basePrice =
    typeof raw.basePrice === "number"
      ? raw.basePrice
      : typeof raw.basePrice === "string"
        ? Number(raw.basePrice)
        : NaN;
  const link = typeof raw.link === "string" ? raw.link.trim() : "";

  if (!id || !name || !category || !Number.isFinite(basePrice) || basePrice < 0) {
    return null;
  }

  const climates = readStringArray(raw.climates, CLIMATES) as Climate[] | undefined;
  const dormTypes = readStringArray(raw.dormTypes, DORM_TYPES) as
    | DormType[]
    | undefined;
  const hobby =
    typeof raw.hobby === "string" && HOBBIES.includes(raw.hobby as Hobby)
      ? (raw.hobby as Hobby)
      : undefined;

  return {
    id,
    name,
    category,
    basePrice: Math.round(basePrice),
    link: link || `https://www.example-shop.com/search?q=${encodeURIComponent(name)}`,
    climates,
    dormTypes,
    hobby,
    essential: raw.essential === true,
    priority:
      typeof raw.priority === "number" && Number.isFinite(raw.priority)
        ? raw.priority
        : undefined,
  };
}

/** Accept `{ products: [...] }` or a bare array of products. */
export function parseCatalogPayload(data: unknown): CatalogProduct[] {
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.products)
      ? data.products
      : [];

  const products: CatalogProduct[] = [];
  for (const entry of list) {
    const parsed = parseOneProduct(entry);
    if (parsed) products.push(parsed);
  }
  return products;
}
