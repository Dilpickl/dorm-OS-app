// Server-side checklist persistence in Supabase.

import { generateSaveToken } from "../security/saveToken";
import { getSupabaseAdmin } from "../supabase/admin";
import { isSupabaseConfigured } from "../supabase/config";
import type { ChecklistItem, ItemSelection, OnboardingAnswers } from "../types";
import type { PersistedChecklist } from "./checklistPersistence";
import { ChecklistAuthError } from "./checklistAuth";

const CUSTOM_ITEMS_SELECTION_KEY = "__customItems";

export interface ChecklistRowMeta {
  saveToken: string | null;
}

function rowToPersisted(
  data: {
    fingerprint: string;
    selections: unknown;
    removed: unknown;
    updated_at: string;
  }
): PersistedChecklist {
  const rawSelections = data.selections as Record<string, unknown>;
  const customItems = Array.isArray(rawSelections[CUSTOM_ITEMS_SELECTION_KEY])
    ? (rawSelections[CUSTOM_ITEMS_SELECTION_KEY] as ChecklistItem[])
    : [];
  const selections = { ...rawSelections };
  delete selections[CUSTOM_ITEMS_SELECTION_KEY];

  return {
    version: 1,
    fingerprint: data.fingerprint,
    selections: selections as Record<string, ItemSelection>,
    removed: data.removed as string[],
    customItems,
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

export async function getChecklistRowMeta(
  fingerprint: string
): Promise<ChecklistRowMeta | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("checklist_saves")
    .select("save_token")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (error || !data) return null;
  const saveToken =
    typeof data.save_token === "string" && data.save_token.length > 0
      ? data.save_token
      : null;
  return { saveToken };
}

export async function loadChecklistFromSupabase(
  fingerprint: string
): Promise<{ checklist: PersistedChecklist; saveToken: string | null } | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("checklist_saves")
    .select("fingerprint, selections, removed, updated_at, save_token")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (error || !data) return null;

  const saveToken =
    typeof data.save_token === "string" && data.save_token.length > 0
      ? data.save_token
      : null;

  return {
    checklist: rowToPersisted(data),
    saveToken,
  };
}

/** Issue a save token for legacy rows that predate token auth. */
export async function migrateChecklistSaveToken(
  fingerprint: string
): Promise<string> {
  const token = generateSaveToken();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("checklist_saves")
    .update({ save_token: token })
    .eq("fingerprint", fingerprint)
    .is("save_token", null);

  if (error) {
    throw new Error(`Supabase save token migration failed: ${error.message}`);
  }
  return token;
}

export async function saveChecklistToSupabase(
  fingerprint: string,
  answers: OnboardingAnswers,
  selections: Record<string, ItemSelection>,
  removed: string[],
  customItems: ChecklistItem[] = [],
  clientSaveToken: string | null = null
): Promise<{ updatedAt: number; saveToken: string }> {
  const supabase = getSupabaseAdmin();
  const updatedAt = new Date().toISOString();

  const meta = await getChecklistRowMeta(fingerprint);
  let saveToken = meta?.saveToken ?? null;

  if (saveToken) {
    if (!clientSaveToken || clientSaveToken !== saveToken) {
      throw new ChecklistAuthError();
    }
  } else if (meta) {
    saveToken = generateSaveToken();
  } else {
    saveToken = generateSaveToken();
  }

  const { error } = await supabase.from("checklist_saves").upsert(
    {
      fingerprint,
      answers,
      selections: {
        ...selections,
        [CUSTOM_ITEMS_SELECTION_KEY]: customItems,
      },
      removed,
      updated_at: updatedAt,
      save_token: saveToken,
    },
    { onConflict: "fingerprint" }
  );

  if (error) {
    throw new Error(`Supabase checklist save failed: ${error.message}`);
  }

  return { updatedAt: new Date(updatedAt).getTime(), saveToken };
}

export async function deleteChecklistFromSupabase(
  fingerprint: string,
  clientSaveToken: string | null = null
): Promise<void> {
  const meta = await getChecklistRowMeta(fingerprint);
  if (!meta) return;

  if (meta.saveToken) {
    if (!clientSaveToken || clientSaveToken !== meta.saveToken) {
      throw new ChecklistAuthError();
    }
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("checklist_saves")
    .delete()
    .eq("fingerprint", fingerprint);

  if (error) {
    throw new Error(`Supabase checklist delete failed: ${error.message}`);
  }
}
