// Server-side checklist persistence in Supabase.

import { getSupabaseAdmin } from "../supabase/admin";
import { isSupabaseConfigured } from "../supabase/config";
import type { ChecklistItem, ItemSelection, OnboardingAnswers } from "../types";
import type { PersistedChecklist } from "./checklistPersistence";

const CUSTOM_ITEMS_SELECTION_KEY = "__customItems";

export async function loadChecklistFromSupabase(
  fingerprint: string
): Promise<PersistedChecklist | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("checklist_saves")
    .select("fingerprint, answers, selections, removed, updated_at")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (error || !data) return null;

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

export async function saveChecklistToSupabase(
  fingerprint: string,
  answers: OnboardingAnswers,
  selections: Record<string, ItemSelection>,
  removed: string[],
  customItems: ChecklistItem[] = []
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const updatedAt = new Date().toISOString();

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
    },
    { onConflict: "fingerprint" }
  );

  if (error) {
    throw new Error(`Supabase checklist save failed: ${error.message}`);
  }

  return new Date(updatedAt).getTime();
}

export async function deleteChecklistFromSupabase(
  fingerprint: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("checklist_saves")
    .delete()
    .eq("fingerprint", fingerprint);

  if (error) {
    throw new Error(`Supabase checklist delete failed: ${error.message}`);
  }
}
