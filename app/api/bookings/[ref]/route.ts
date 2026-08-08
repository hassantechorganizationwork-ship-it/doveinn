import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmedEmail, sendFullyPaidEmail } from "@/lib/email";

// Public lookup for the "Track Booking" page and the receipt page — a
// booking ref plus the exact guest email it was made under, so a guest can
// check status or pull up their receipt without needing an account.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const email = request.nextUrl.searchParams.get("email");

  const supabase = createAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, rooms(name, type)")
    .eq("booking_ref", ref)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (
    !booking ||
    (email && booking.guest_email.toLowerCase() !== email.trim().toLowerCase())
  ) {
    return NextResponse.json(
      { success: false, error: "No booking found with that reference and email." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: booking });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const body = await request.json();
  const { action, manager_notes, payment_status } = body;

  const supabase = createAdminClient();

  const VALID_PAYMENT_STATUSES = [
    "pending",
    "advance_paid",
    "fully_paid",
    "refunded",
  ];

  if (action === "set_payment_status") {
    if (!VALID_PAYMENT_STATUSES.includes(payment_status)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment status" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({ payment_status, updated_at: new Date().toISOString() })
      .eq("booking_ref", ref)
      .select("*, rooms(name)")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (payment_status === "fully_paid" && updated) {
      sendFullyPaidEmail({
        bookingRef: updated.booking_ref,
        guestName: updated.guest_name,
        guestEmail: updated.guest_email,
        roomName: updated.rooms?.name ?? "Room",
        checkIn: updated.check_in,
        checkOut: updated.check_out,
        totalAmount: updated.total_amount,
        advanceAmount: updated.advance_amount,
      }).catch((err) => console.error("sendFullyPaidEmail failed:", err));
    }

    return NextResponse.json({ success: true });
  }

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
    .select("*, rooms(name)")
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

    sendBookingConfirmedEmail({
      bookingRef: booking.booking_ref,
      guestName: booking.guest_name,
      guestEmail: booking.guest_email,
      roomName: booking.rooms?.name ?? "Room",
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      advanceAmount: booking.advance_amount,
    }).catch((err) => console.error("sendBookingConfirmedEmail failed:", err));
  }

  return NextResponse.json({ success: true });
}
