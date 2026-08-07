import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data, error }, { data: blocked }] = await Promise.all([
    supabase.from("rooms").select("*").order("type").order("name"),
    supabase.from("room_availability").select("room_id").eq("blocked_date", today),
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  const blockedIds = new Set((blocked ?? []).map((row) => row.room_id));
  const withStatus = (data ?? []).map((room) => ({
    ...room,
    booked_today: blockedIds.has(room.id),
  }));

  return NextResponse.json({ success: true, data: withStatus });
}
