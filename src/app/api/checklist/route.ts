// GET  /api/checklist?fingerprint=...&saveToken=...
// POST /api/checklist  { answers, selections, removed, customItems?, saveToken? }
// DELETE /api/checklist?fingerprint=...&saveToken=...

import { NextResponse } from "next/server";
import { CHECKLIST_BODY_MAX_BYTES, FINGERPRINT_MAX_LENGTH } from "@/lib/security/limits";
import { rateLimitOrNull } from "@/lib/security/withRateLimit";
import { isValidSaveToken } from "@/lib/security/saveToken";
import { validateChecklistPayload } from "@/lib/security/checklistPayload";
import { buildAnswersFingerprint } from "@/lib/storage/checklistPersistence";
import { ChecklistAuthError } from "@/lib/storage/checklistAuth";
import {
  deleteChecklistFromSupabase,
  loadChecklistFromSupabase,
  migrateChecklistSaveToken,
  saveChecklistToSupabase,
} from "@/lib/storage/supabaseChecklist";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function parseFingerprint(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > FINGERPRINT_MAX_LENGTH) return null;
  return trimmed;
}

function parseSaveTokenParam(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  return isValidSaveToken(trimmed) ? trimmed : null;
}

async function readJsonBody(request: Request): Promise<unknown | NextResponse> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const length = Number(contentLength);
    if (Number.isFinite(length) && length > CHECKLIST_BODY_MAX_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
  }

  const raw = await request.text();
  if (raw.length > CHECKLIST_BODY_MAX_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  if (!raw) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const limited = await rateLimitOrNull(request, "/api/checklist");
  if (limited) return limited;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const params = new URL(request.url).searchParams;
  const fingerprint = parseFingerprint(params.get("fingerprint"));
  if (!fingerprint) {
    return NextResponse.json({ error: "Missing or invalid fingerprint" }, { status: 400 });
  }

  const clientToken = parseSaveTokenParam(params.get("saveToken"));
  const loaded = await loadChecklistFromSupabase(fingerprint);
  if (!loaded) {
    return NextResponse.json({ saved: null });
  }

  const { checklist, saveToken: rowToken } = loaded;
  let saveToken = rowToken;

  if (rowToken) {
    if (!clientToken || clientToken !== rowToken) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    saveToken = await migrateChecklistSaveToken(fingerprint);
  }

  return NextResponse.json({ saved: checklist, saveToken });
}

export async function POST(request: Request) {
  const limited = await rateLimitOrNull(request, "/api/checklist");
  if (limited) return limited;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const parsed = await readJsonBody(request);
  if (parsed instanceof NextResponse) return parsed;

  const payload = validateChecklistPayload(parsed);
  if (!payload) {
    return NextResponse.json({ error: "Invalid checklist payload" }, { status: 400 });
  }

  const body = parsed as Record<string, unknown>;
  const clientToken =
    typeof body.saveToken === "string"
      ? parseSaveTokenParam(body.saveToken)
      : null;

  const fingerprint = buildAnswersFingerprint(payload.answers);

  try {
    const { updatedAt, saveToken } = await saveChecklistToSupabase(
      fingerprint,
      payload.answers,
      payload.selections,
      payload.removed,
      payload.customItems,
      clientToken
    );

    return NextResponse.json({ ok: true, fingerprint, updatedAt, saveToken });
  } catch (error) {
    if (error instanceof ChecklistAuthError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }
}

export async function DELETE(request: Request) {
  const limited = await rateLimitOrNull(request, "/api/checklist");
  if (limited) return limited;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const params = new URL(request.url).searchParams;
  const fingerprint = parseFingerprint(params.get("fingerprint"));
  if (!fingerprint) {
    return NextResponse.json({ error: "Missing or invalid fingerprint" }, { status: 400 });
  }

  const clientToken = parseSaveTokenParam(params.get("saveToken"));

  try {
    await deleteChecklistFromSupabase(fingerprint, clientToken);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ChecklistAuthError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }
}
