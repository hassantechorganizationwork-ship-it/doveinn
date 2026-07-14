"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { cn } from "@/lib/utils";
import type { BookingWithRoom, PaymentStatus } from "@/lib/supabase/bookings";

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Not Paid Yet",
  advance_paid: "Advance Paid ✓",
  fully_paid: "Fully Paid ✓",
  refunded: "Refunded",
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-gray-400 text-white",
  advance_paid: "bg-green-600 text-white",
  fully_paid: "bg-green-600 text-white",
  refunded: "bg-red-600 text-white",
};

export function BookingDetail({ booking }: { booking: BookingWithRoom }) {
  const router = useRouter();
  const [notes, setNotes] = useState(booking.manager_notes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<
    "confirm" | "reject" | "notes" | null
  >(null);

  const nights = differenceInCalendarDays(
    new Date(booking.check_out),
    new Date(booking.check_in)
  );
  const remaining = booking.total_amount - booking.advance_amount;

  const callApi = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/bookings/${booking.booking_ref}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const handleConfirm = async () => {
    setLoadingAction("confirm");
    const result = await callApi({ action: "confirm" });
    setLoadingAction(null);
    setMessage(
      result.success ? "Booking confirmed successfully." : result.error ?? "Something went wrong."
    );
    if (result.success) router.refresh();
  };

  const handleReject = async () => {
    setLoadingAction("reject");
    const result = await callApi({ action: "reject" });
    setLoadingAction(null);
    setMessage(result.success ? "Booking rejected." : result.error ?? "Something went wrong.");
    if (result.success) router.refresh();
  };

  const handleSaveNotes = async () => {
    setLoadingAction("notes");
    const result = await callApi({ manager_notes: notes });
    setLoadingAction(null);
    setMessage(result.success ? "Notes saved." : result.error ?? "Something went wrong.");
  };

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/dashboard/bookings"
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-gold"
      >
        <ArrowLeft className="size-4" />
        Back to Bookings
      </Link>

      <h1 className="mt-4 font-heading text-3xl text-primary">
        Booking {booking.booking_ref}
      </h1>

      {message && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* BOOKING INFO */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg text-primary">Booking Info</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Ref#</p>
              <p className="mt-1 font-medium text-primary">
                {booking.booking_ref}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={booking.booking_status} />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="mt-1 font-medium text-primary">
                {new Date(booking.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Nights</p>
              <p className="mt-1 font-medium text-primary">{nights}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Check-in</p>
              <p className="mt-1 font-medium text-primary">
                {booking.check_in}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Check-out</p>
              <p className="mt-1 font-medium text-primary">
                {booking.check_out}
              </p>
            </div>
          </div>
        </div>

        {/* GUEST INFO */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg text-primary">Guest Info</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-primary">
                {booking.guest_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-primary">
                {booking.guest_email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-primary">
                {booking.guest_phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CNIC</span>
              <span className="font-medium text-primary">
                {booking.guest_cnic ?? "Not provided"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Special Requests</span>
              <span className="font-medium text-primary">
                {booking.special_requests ?? "None"}
              </span>
            </div>
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg text-primary">Payment Info</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium text-primary">
                Rs {booking.total_amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advance Paid</span>
              <span className="font-medium text-green-600">
                Rs {booking.advance_amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Remaining at Hotel
              </span>
              <span className="font-medium text-primary">
                Rs {remaining.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <Badge
                className={cn(
                  "border-none",
                  PAYMENT_STATUS_STYLES[booking.payment_status]
                )}
              >
                {PAYMENT_STATUS_LABELS[booking.payment_status]}
              </Badge>
            </div>
          </div>
        </div>

        {/* ROOM INFO */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg text-primary">Room Info</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Room</span>
              <span className="font-medium text-primary">
                {booking.rooms?.name ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type</span>
              <Badge className="border-none bg-gold text-gold-foreground">
                {booking.rooms?.type === "master" ? "Master" : "Twin"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price / Night</span>
              <span className="font-medium text-primary">
                Rs {(booking.rooms?.price_per_night ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MANAGER ACTIONS */}
      {booking.booking_status === "pending" && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg text-primary">
            Manager Actions
          </h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={handleConfirm}
              disabled={loadingAction !== null}
            >
              {loadingAction === "confirm" && <Spinner />}
              {loadingAction === "confirm" ? "Confirming..." : "Confirm Booking"}
            </Button>
            <Button
              size="lg"
              className="w-full bg-red-600 text-white hover:bg-red-700"
              onClick={handleReject}
              disabled={loadingAction !== null}
            >
              {loadingAction === "reject" && <Spinner />}
              {loadingAction === "reject" ? "Rejecting..." : "Reject Booking"}
            </Button>
          </div>
        </div>
      )}

      {/* MANAGER NOTES */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg text-primary">Manager Notes</h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this booking"
          className="mt-4 min-h-28"
        />
        <Button
          className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90"
          onClick={handleSaveNotes}
          disabled={loadingAction !== null}
        >
          {loadingAction === "notes" && <Spinner />}
          {loadingAction === "notes" ? "Saving..." : "Save Notes"}
        </Button>
      </div>
    </div>
  );
}
