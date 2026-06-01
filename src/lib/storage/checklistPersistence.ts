// Checklist persistence — Supabase (via API) when configured, else localStorage.

import { isSupabasePersistenceEnabled } from "../supabase/config";
import type { ItemSelection, OnboardingAnswers } from "../types";

const STORAGE_KEY = "dorm-living-os:checklist:v1";

export interface PersistedChecklist {
  version: 1;
  fingerprint: string;
  selections: Record<string, ItemSelection>;
  removed: string[];
  updatedAt: number;
}

export function buildAnswersFingerprint(answers: OnboardingAnswers): string {
  const hobbies = [...answers.hobbies].sort().join(",");
  const budget =
    answers.budget === "unknown" ? "unknown" : String(answers.budget);
  return [
    answers.school.trim().toLowerCase(),
    answers.climate,
    budget,
    answers.dormType,
    hobbies,
  ].join("|");
}

export function usesCloudPersistence(): boolean {
  return isSupabasePersistenceEnabled();
}

// ----- localStorage -----

function loadFromLocal(answers: OnboardingAnswers): PersistedChecklist | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedChecklist;
    if (parsed.version !== 1) return null;

    const fingerprint = buildAnswersFingerprint(answers);
    if (parsed.fingerprint !== fingerprint) return null;

    return parsed;
  } catch {
    return null;
  }
}

function saveToLocal(
  answers: OnboardingAnswers,
  selections: Record<string, ItemSelection>,
  removed: Set<string>
): number {
  const updatedAt = Date.now();
  const payload: PersistedChecklist = {
    version: 1,
    fingerprint: buildAnswersFingerprint(answers),
    selections,
    removed: Array.from(removed),
    updatedAt,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("[storage] localStorage save failed:", error);
  }

  return updatedAt;
}

function clearLocal(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ----- Supabase via /api/checklist -----

async function loadFromCloud(
  answers: OnboardingAnswers
): Promise<PersistedChecklist | null> {
  const fingerprint = buildAnswersFingerprint(answers);
  const response = await fetch(
    `/api/checklist?fingerprint=${encodeURIComponent(fingerprint)}`
  );

  if (!response.ok) return null;

  const data = (await response.json()) as { saved: PersistedChecklist | null };
  return data.saved;
}

async function saveToCloud(
  answers: OnboardingAnswers,
  selections: Record<string, ItemSelection>,
  removed: Set<string>
): Promise<number> {
  const response = await fetch("/api/checklist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers,
      selections,
      removed: Array.from(removed),
    }),
  });

  if (!response.ok) {
    throw new Error("Cloud save failed");
  }

  const data = (await response.json()) as { updatedAt: number };
  return data.updatedAt;
}

async function clearCloud(answers: OnboardingAnswers): Promise<void> {
  const fingerprint = buildAnswersFingerprint(answers);
  await fetch(`/api/checklist?fingerprint=${encodeURIComponent(fingerprint)}`, {
    method: "DELETE",
  });
}

// ----- Public API -----

export async function loadPersistedChecklist(
  answers: OnboardingAnswers
): Promise<PersistedChecklist | null> {
  if (usesCloudPersistence()) {
    try {
      const cloud = await loadFromCloud(answers);
      if (cloud) return cloud;
    } catch (error) {
      console.warn("[storage] Cloud load failed, trying local:", error);
    }
  }
  return loadFromLocal(answers);
}

export async function savePersistedChecklist(
  answers: OnboardingAnswers,
  selections: Record<string, ItemSelection>,
  removed: Set<string>
): Promise<number> {
  if (usesCloudPersistence()) {
    try {
      return await saveToCloud(answers, selections, removed);
    } catch (error) {
      console.warn("[storage] Cloud save failed, using local:", error);
    }
  }
  return saveToLocal(answers, selections, removed);
}

export async function clearPersistedChecklist(
  answers: OnboardingAnswers
): Promise<void> {
  if (usesCloudPersistence()) {
    try {
      await clearCloud(answers);
    } catch (error) {
      console.warn("[storage] Cloud clear failed:", error);
    }
  }
  clearLocal();
}

export function formatSavedTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
