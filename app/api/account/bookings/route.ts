import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json(
      { success: false, error: "You must be signed in to do that." },
      { status: 401 }
    );
  }

  // Query with the admin client but filter by the session's own verified
  // email server-side — the client never gets to choose which email is
  // queried, so this can't be used to read another guest's bookings.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bookings")
    .select("*, rooms(name, type)")
    .eq("guest_email", user.email)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
