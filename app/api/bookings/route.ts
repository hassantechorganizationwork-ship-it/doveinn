import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingEmails } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      room_id,
      guest_name,
      guest_email,
      guest_phone,
      guest_cnic,
      check_in,
      check_out,
      total_amount,
      advance_amount,
      special_requests,
    } = body;

    if (
      !room_id ||
      !guest_name ||
      !guest_email ||
      !guest_phone ||
      !check_in ||
      !check_out ||
      typeof total_amount !== "number" ||
      typeof advance_amount !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ref = "DI-" + Date.now().toString().slice(-6);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        booking_ref: ref,
        room_id,
        guest_name,
        guest_email,
        guest_phone,
        guest_cnic: guest_cnic || null,
        check_in,
        check_out,
        total_amount,
        advance_amount,
        special_requests: special_requests || null,
      })
      .select("*, rooms(name)")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message ?? "Failed to create booking" },
        { status: 500 }
      );
    }

    // Guest receipt + hotel notification. Never let an email hiccup fail
    // the booking itself — the booking is already saved at this point.
    sendBookingEmails({
      bookingRef: ref,
      guestName: guest_name,
      guestEmail: guest_email,
      guestPhone: guest_phone,
      roomName: data.rooms?.name ?? "Room",
      checkIn: check_in,
      checkOut: check_out,
      totalAmount: total_amount,
      advanceAmount: advance_amount,
    }).catch((err) => console.error("sendBookingEmails failed:", err));

    return NextResponse.json({ success: true, booking_ref: ref });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
