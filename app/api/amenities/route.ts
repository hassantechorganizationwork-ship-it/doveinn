import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("amenities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
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

  let body: { name?: unknown; description?: unknown; icon?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { success: false, error: "Name is required" },
      { status: 400 }
    );
  }

  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;
  const icon =
    typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : null;

  const { data, error } = await supabase
    .from("amenities")
    .insert({ name, description, icon })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: error?.message ?? "Failed to create amenity" },
      { status: 500 }
    );
  }

  revalidatePath("/");

  return NextResponse.json({ success: true, data }, { status: 201 });
}
