// GET  /api/checklist?fingerprint=...
// POST /api/checklist  { answers, selections, removed }
// DELETE /api/checklist?fingerprint=...

import { NextResponse } from "next/server";
import { buildAnswersFingerprint } from "@/lib/storage/checklistPersistence";
import {
  deleteChecklistFromSupabase,
  loadChecklistFromSupabase,
  saveChecklistToSupabase,
} from "@/lib/storage/supabaseChecklist";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  ChecklistItem,
  ItemSelection,
  OnboardingAnswers,
} from "@/lib/types";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const fingerprint = new URL(request.url).searchParams.get("fingerprint");
  if (!fingerprint) {
    return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
  }

  const saved = await loadChecklistFromSupabase(fingerprint);
  if (!saved) {
    return NextResponse.json({ saved: null });
  }

  return NextResponse.json({ saved });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  let body: {
    answers?: OnboardingAnswers;
    selections?: Record<string, ItemSelection>;
    removed?: string[];
    customItems?: ChecklistItem[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.answers || !body.selections || !Array.isArray(body.removed)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const fingerprint = buildAnswersFingerprint(body.answers);
  const updatedAt = await saveChecklistToSupabase(
    fingerprint,
    body.answers,
    body.selections,
    body.removed,
    body.customItems ?? []
  );

  return NextResponse.json({ ok: true, fingerprint, updatedAt });
}

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const fingerprint = new URL(request.url).searchParams.get("fingerprint");
  if (!fingerprint) {
    return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
  }

  await deleteChecklistFromSupabase(fingerprint);
  return NextResponse.json({ ok: true });
}
