import type { PriceTiers } from "../types";

/** Custom tier prices when deriveTiers(basePrice) does not match the product range. */
export const CATALOG_TIER_OVERRIDES: Record<string, PriceTiers> = {
  "portable-vacuum": {
    bare: 10,
    standard: 25,
    comfortable: 40,
    premium: 60,
  },
  "ear-plugs": {
    bare: 7,
    standard: 12,
    comfortable: 18,
    premium: 25,
  },
  tv: {
    bare: 60,
    standard: 150,
    comfortable: 300,
    premium: 500,
  },
  "board-games": {
    bare: 10,
    standard: 25,
    comfortable: 40,
    premium: 60,
  },
};
