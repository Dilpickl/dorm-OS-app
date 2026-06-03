// GET /api/catalog — returns the normalized product catalog as JSON.
// Useful for debugging, mobile clients, or hosting a static catalog file
// that matches this shape.

import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog/getCatalog";
import { rateLimitOrNull } from "@/lib/security/withRateLimit";

export async function GET(request: Request) {
  const limited = await rateLimitOrNull(request, "/api/catalog");
  if (limited) return limited;

  const { products, source } = await getCatalog();
  return NextResponse.json({
    products,
    source,
    updatedAt: new Date().toISOString(),
  });
}
