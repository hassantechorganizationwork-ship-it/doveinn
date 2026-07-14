import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const room_id = searchParams.get("room_id");
  const check_in = searchParams.get("check_in");
  const check_out = searchParams.get("check_out");

  if (!room_id || !check_in || !check_out) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("room_availability")
    .select("blocked_date")
    .eq("room_id", room_id)
    .gte("blocked_date", check_in)
    .lt("blocked_date", check_out);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ available: (data?.length ?? 0) === 0 });
}
