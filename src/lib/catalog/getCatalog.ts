// Single entry point for loading the catalog on the server.
//
// Priority:
//   1. Supabase (when NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
//   2. External CATALOG_API_URL
//   3. Built-in mock catalog

import { mockCatalog } from "../mockData";
import { isSupabaseConfigured } from "../supabase/config";
import { fetchExternalCatalog } from "./fetchCatalog";
import { fetchSupabaseCatalog } from "./fetchSupabase";
import type { CatalogProduct } from "./types";

export type CatalogSource = "supabase" | "api" | "mock";

let cachedCatalog: CatalogProduct[] | null = null;
let cacheExpiresAt = 0;
let cachedSource: CatalogSource = "mock";
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getCatalog(): Promise<{
  products: CatalogProduct[];
  source: CatalogSource;
}> {
  const now = Date.now();
  if (cachedCatalog && now < cacheExpiresAt) {
    return { products: cachedCatalog, source: cachedSource };
  }

  if (isSupabaseConfigured()) {
    try {
      const products = await fetchSupabaseCatalog();
      cachedCatalog = products;
      cachedSource = "supabase";
      cacheExpiresAt = now + CACHE_TTL_MS;
      return { products, source: "supabase" };
    } catch (error) {
      console.error("[catalog] Supabase failed, trying fallbacks:", error);
    }
  }

  const apiUrl = process.env.CATALOG_API_URL?.trim();
  const apiKey = process.env.CATALOG_API_KEY?.trim();

  if (apiUrl) {
    try {
      const products = await fetchExternalCatalog(apiUrl, apiKey);
      cachedCatalog = products;
      cachedSource = "api";
      cacheExpiresAt = now + CACHE_TTL_MS;
      return { products, source: "api" };
    } catch (error) {
      console.error("[catalog] External API failed:", error);
    }
  }

  return { products: mockCatalog, source: "mock" };
}
