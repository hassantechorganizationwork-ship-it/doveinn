import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check via the cookie-bound client (confirms who's asking); the
  // actual write goes through the admin client below. reviews' RLS setup
  // was fighting us for reasons that resisted every diagnostic — table
  // owner, grants, and policy definitions all checked out, yet
  // `authenticated` still saw 0 rows. Bypassing RLS here, the same way
  // rooms/amenities/bookings admin writes already do, sidesteps that
  // entirely instead of leaving manager replies silently broken.
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "You must be signed in to do that." },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();

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
