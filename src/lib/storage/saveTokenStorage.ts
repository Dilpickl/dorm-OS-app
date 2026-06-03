// Client-only storage for per-fingerprint cloud save tokens.

const TOKEN_STORAGE_KEY = "dorm-living-os:checklist-save-token:v1";

function readMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn("[storage] save token write failed:", error);
  }
}

export function getStoredSaveToken(fingerprint: string): string | null {
  return readMap()[fingerprint] ?? null;
}

export function setStoredSaveToken(fingerprint: string, token: string): void {
  const map = readMap();
  map[fingerprint] = token;
  writeMap(map);
}

export function clearStoredSaveToken(fingerprint: string): void {
  const map = readMap();
  delete map[fingerprint];
  writeMap(map);
}
