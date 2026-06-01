// Catalog product shape — used by mock data, external APIs, and the
// recommendation engine.

import type { Climate, DormType, Hobby } from "../types";

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  link: string;

  climates?: Climate[];
  dormTypes?: DormType[];
  hobby?: Hobby;

  /** Core move-in item; always recommended when filters pass. */
  essential?: boolean;

  /** Higher = listed earlier within a category (default 50). */
  priority?: number;
}

/** JSON body returned by GET /api/catalog or an external catalog API. */
export interface CatalogApiResponse {
  products: CatalogProduct[];
  source?: string;
  updatedAt?: string;
}
