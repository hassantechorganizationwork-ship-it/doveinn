import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "You must be signed in to do that." },
      { status: 401 }
    );
  }

  let body: { manager_reply?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const manager_reply =
    typeof body.manager_reply === "string" && body.manager_reply.trim()
      ? body.manager_reply.trim()
      : null;

  const { data, error } = await supabase
    .from("reviews")
    .update({ manager_reply })
    .eq("id", id)
    .select("id, guest_name, rating, review_text, stay_date, photo_url, manager_reply, created_at, rooms(name)")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { success: false, error: "Review not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data });
}
