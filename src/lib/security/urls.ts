// Allow only safe https URLs for user-supplied links (custom items, etc.).

const PLACEHOLDER_LINK = "#";

export function isAllowedItemLink(link: string): boolean {
  if (link === PLACEHOLDER_LINK) return true;
  try {
    const url = new URL(link);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeItemLink(link: string): string {
  const trimmed = link.trim();
  if (!trimmed || trimmed === PLACEHOLDER_LINK) return PLACEHOLDER_LINK;
  return isAllowedItemLink(trimmed) ? trimmed : PLACEHOLDER_LINK;
}
