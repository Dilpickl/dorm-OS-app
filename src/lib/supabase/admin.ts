// Server-only Supabase client (service role). Never import in client components.

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./config";

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  base_price: number;
  link: string | null;
  climates: string[] | null;
  dorm_types: string[] | null;
  hobby: string | null;
  essential: boolean;
  priority: number;
}

export interface ChecklistSaveRow {
  fingerprint: string;
  answers: unknown;
  selections: unknown;
  removed: unknown;
  save_token: string | null;
  updated_at: string;
}

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }

  return adminClient;
}
