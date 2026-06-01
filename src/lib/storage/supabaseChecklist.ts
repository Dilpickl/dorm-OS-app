// Server-side checklist persistence in Supabase.

import { getSupabaseAdmin } from "../supabase/admin";
import { isSupabaseConfigured } from "../supabase/config";
import type { ItemSelection, OnboardingAnswers } from "../types";
import type { PersistedChecklist } from "./checklistPersistence";

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

  return {
    version: 1,
    fingerprint: data.fingerprint,
    selections: data.selections as Record<string, ItemSelection>,
    removed: data.removed as string[],
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

export async function saveChecklistToSupabase(
  fingerprint: string,
  answers: OnboardingAnswers,
  selections: Record<string, ItemSelection>,
  removed: string[]
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const updatedAt = new Date().toISOString();

  const { error } = await supabase.from("checklist_saves").upsert(
    {
      fingerprint,
      answers,
      selections,
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
