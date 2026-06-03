import { NextResponse } from "next/server";
import { rateLimitApiRequest } from "./rateLimit";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

/** Returns a 429 response when limited, otherwise null. */
export async function rateLimitOrNull(
  request: Request,
  pathname: string
): Promise<NextResponse | null> {
  const result = await rateLimitApiRequest(pathname, clientIp(request));
  if (result.success) return null;

  const response = NextResponse.json(
    { error: "Too many requests" },
    { status: 429 }
  );
  if (result.limit !== undefined) {
    response.headers.set("X-RateLimit-Limit", String(result.limit));
  }
  if (result.remaining !== undefined) {
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  }
  if (result.reset !== undefined) {
    response.headers.set("X-RateLimit-Reset", String(result.reset));
  }
  return response;
}
