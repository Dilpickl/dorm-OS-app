import { randomBytes } from "crypto";

/** Opaque per-save secret; required for cloud read/write after first save. */
export function generateSaveToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isValidSaveToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,64}$/.test(token);
}
