/**
 * Seeds Supabase `products` from the built-in mock catalog.
 *
 * Usage:
 *   1. Run supabase/schema.sql in the Supabase SQL Editor
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. npm run db:seed
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { mockCatalog } from "../src/lib/mockData";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const rows = mockCatalog.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  base_price: p.basePrice,
  link: p.link,
  climates: p.climates ?? null,
  dorm_types: p.dormTypes ?? null,
  hobby: p.hobby ?? null,
  essential: p.essential ?? false,
  priority: p.priority ?? 50,
}));

async function main() {
  console.log(`Upserting ${rows.length} products...`);

  const { error } = await supabase.from("products").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log("Done. Products table is ready.");
}

main();
