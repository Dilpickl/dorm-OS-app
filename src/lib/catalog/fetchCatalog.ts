// Fetches the product catalog from an external HTTP API.

import { parseCatalogPayload } from "./validate";
import type { CatalogProduct } from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;

export async function fetchExternalCatalog(
  apiUrl: string,
  apiKey?: string
): Promise<CatalogProduct[]> {
  const headers: HeadersInit = { Accept: "application/json" };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl, {
      headers,
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Catalog API ${response.status}: ${response.statusText}`);
    }

    const data: unknown = await response.json();
    const products = parseCatalogPayload(data);

    if (products.length === 0) {
      throw new Error("Catalog API returned no valid products");
    }

    return products;
  } finally {
    clearTimeout(timeout);
  }
}
