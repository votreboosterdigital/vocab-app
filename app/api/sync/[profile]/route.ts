import { NextRequest } from "next/server";
import type { UserProgress } from "@/types";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

const BASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ profile: string }> }
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return Response.json(null);
  }

  const { profile } = await params;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/vocab_progress?profile=eq.${encodeURIComponent(profile)}&select=data`,
      { headers: BASE_HEADERS }
    );
    if (!res.ok) return Response.json(null);
    const rows = (await res.json()) as { data: UserProgress }[];
    return Response.json(rows[0]?.data ?? null);
  } catch {
    return Response.json(null);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ profile: string }> }
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return Response.json({ ok: false, reason: "no_config" });
  }

  const { profile } = await params;

  try {
    const body = (await req.json()) as UserProgress;
    await fetch(`${SUPABASE_URL}/rest/v1/vocab_progress`, {
      method: "POST",
      headers: { ...BASE_HEADERS, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        profile,
        data: body,
        updated_at: new Date().toISOString(),
      }),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[sync] POST error:", err);
    return Response.json({ ok: false });
  }
}
