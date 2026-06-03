// Shared size limits — keep client inputs and API validation in sync.

export const SCHOOL_MAX_LENGTH = 120;
export const ITEM_NAME_MAX_LENGTH = 200;
export const CATEGORY_MAX_LENGTH = 80;
export const FINGERPRINT_MAX_LENGTH = 512;

export const MAX_CUSTOM_ITEMS = 100;
export const MAX_REMOVED_IDS = 500;
export const MAX_SELECTION_ENTRIES = 500;

/** Max JSON body size for checklist POST (bytes). */
export const CHECKLIST_BODY_MAX_BYTES = 256 * 1024;
