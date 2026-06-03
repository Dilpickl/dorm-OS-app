import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const API_LIMIT = 60;
const API_WINDOW = "1 m";

let checklistLimiter: Ratelimit | null | undefined;
let catalogLimiter: Ratelimit | null | undefined;

function createLimiter(prefix: string): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(API_LIMIT, API_WINDOW),
    prefix: `dorm-living-os:${prefix}`,
    analytics: false,
  });
}

function getChecklistLimiter(): Ratelimit | null {
  if (checklistLimiter === undefined) {
    checklistLimiter = createLimiter("checklist-api");
  }
  return checklistLimiter;
}

function getCatalogLimiter(): Ratelimit | null {
  if (catalogLimiter === undefined) {
    catalogLimiter = createLimiter("catalog-api");
  }
  return catalogLimiter;
}

export function isRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export async function rateLimitApiRequest(
  pathname: string,
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  const limiter = pathname.startsWith("/api/checklist")
    ? getChecklistLimiter()
    : pathname.startsWith("/api/catalog")
      ? getCatalogLimiter()
      : null;

  if (!limiter) {
    return { success: true };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
