// Load the product catalog from Supabase `products` table.

import { getSupabaseAdmin, type ProductRow } from "../supabase/admin";
import type { CatalogProduct } from "./types";
import type { Climate, DormType, Hobby } from "../types";

const CLIMATES: Climate[] = ["hot", "cold", "four-season", "variable"];
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

function mapRow(row: ProductRow): CatalogProduct | null {
  const climates = (row.climates ?? []).filter((c): c is Climate =>
    CLIMATES.includes(c as Climate)
  );
  const dormTypes = (row.dorm_types ?? []).filter((d): d is DormType =>
    DORM_TYPES.includes(d as DormType)
  );
  const hobby =
    row.hobby && HOBBIES.includes(row.hobby as Hobby)
      ? (row.hobby as Hobby)
      : undefined;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    basePrice: row.base_price,
    link:
      row.link ??
      `https://www.example-shop.com/search?q=${encodeURIComponent(row.name)}`,
    climates: climates.length > 0 ? climates : undefined,
    dormTypes: dormTypes.length > 0 ? dormTypes : undefined,
    hobby,
    essential: row.essential,
    priority: row.priority,
  };
}

export async function fetchSupabaseCatalog(): Promise<CatalogProduct[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category")
    .order("priority", { ascending: false });

  if (error) {
    throw new Error(`Supabase products query failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Supabase products table is empty. Run: npm run db:seed"
    );
  }

  const products = data
    .map((row) => mapRow(row as ProductRow))
    .filter((p): p is CatalogProduct => p !== null);

  if (products.length === 0) {
    throw new Error("No valid products returned from Supabase");
  }

  return products;
}
