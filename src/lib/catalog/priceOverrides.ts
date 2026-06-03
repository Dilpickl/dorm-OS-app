import type { PriceTiers } from "../types";

/** Custom tier prices when deriveTiers(basePrice) does not match the product range. */
export const CATALOG_TIER_OVERRIDES: Record<string, PriceTiers> = {
  "portable-vacuum": {
    bare: 10,
    standard: 25,
    comfortable: 40,
    premium: 60,
  },
};
