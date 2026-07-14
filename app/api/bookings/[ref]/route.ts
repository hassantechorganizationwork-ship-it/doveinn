import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const body = await request.json();
  const { action, manager_notes } = body;

  const supabase = createAdminClient();

  if (action !== "confirm" && action !== "reject") {
    if (typeof manager_notes === "string") {
      const { error } = await supabase
        .from("bookings")
        .update({ manager_notes, updated_at: new Date().toISOString() })
        .eq("booking_ref", ref);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  }

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_ref", ref)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json(
      { success: false, error: "Booking not found" },
      { status: 404 }
    );
  }

  const newStatus = action === "confirm" ? "confirmed" : "rejected";

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      booking_status: newStatus,
      manager_notes:
        typeof manager_notes === "string" ? manager_notes : booking.manager_notes,
      updated_at: new Date().toISOString(),
    })
    .eq("booking_ref", ref);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: updateError.message },
      { status: 500 }
    );
  }

  if (action === "confirm") {
    const dates: string[] = [];
    const current = new Date(booking.check_in);
    const end = new Date(booking.check_out);

    while (current < end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    if (dates.length > 0) {
      await supabase.from("room_availability").insert(
        dates.map((blocked_date) => ({
          room_id: booking.room_id,
          blocked_date,
          reason: "booked",
          booking_id: booking.id,
        }))
      );
    }
  }

  return NextResponse.json({ success: true });
}
