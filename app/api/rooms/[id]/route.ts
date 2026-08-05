import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

  let body: { price_per_night?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const price = Number(body.price_per_night);
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { success: false, error: "Price must be a positive number" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("rooms")
    .update({ price_per_night: price })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { success: false, error: "Room not found" },
      { status: 404 }
    );
  }

  revalidatePath("/");
  revalidatePath("/rooms");
  revalidatePath(`/rooms/${data.slug}`);

  return NextResponse.json({ success: true, data });
}
