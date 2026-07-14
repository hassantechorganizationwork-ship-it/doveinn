"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { cn } from "@/lib/utils";
import type { BookingStatus, BookingWithRoom } from "@/lib/supabase/bookings";

const FILTERS = ["All", "Pending", "Confirmed", "Rejected", "Cancelled"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_STATUS: Record<Filter, BookingStatus | "all"> = {
  All: "all",
  Pending: "pending",
  Confirmed: "confirmed",
  Rejected: "rejected",
  Cancelled: "cancelled",
};

export function BookingsTable({ bookings }: { bookings: BookingWithRoom[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("All");
  const [pendingRef, setPendingRef] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"confirm" | "reject" | null>(null);

  const countFor = (filterKey: Filter) => {
    const status = FILTER_STATUS[filterKey];
    return status === "all"
      ? bookings.length
      : bookings.filter((b) => b.booking_status === status).length;
  };

  const filteredBookings =
    FILTER_STATUS[filter] === "all"
      ? bookings
      : bookings.filter((b) => b.booking_status === FILTER_STATUS[filter]);

  const updateStatus = async (ref: string, action: "confirm" | "reject") => {
    setPendingRef(ref);
    setPendingAction(action);
    try {
      await fetch(`/api/bookings/${ref}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } finally {
      setPendingRef(null);
      setPendingAction(null);
    }
  };

  return (
    <div className="p-6 md:p-10">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl text-primary">All Bookings</h1>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Export
        </Button>
      </div>

      {/* FILTER TABS */}
      <div className="mt-6 flex flex-wrap gap-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95",
              filter === f
                ? "bg-gold text-gold-foreground"
                : "border border-border bg-white text-primary hover:bg-muted"
            )}
          >
            {f} ({countFor(f)})
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Ref#</th>
                <th className="py-2 pr-4 font-medium">Guest</th>
                <th className="py-2 pr-4 font-medium">Room</th>
                <th className="py-2 pr-4 font-medium">Check-in</th>
                <th className="py-2 pr-4 font-medium">Check-out</th>
                <th className="py-2 pr-4 font-medium">Nights</th>
                <th className="py-2 pr-4 font-medium">Total</th>
                <th className="py-2 pr-4 font-medium">Advance</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const nights = differenceInCalendarDays(
                    new Date(booking.check_out),
                    new Date(booking.check_in)
                  );
                  const isBusy = pendingRef === booking.booking_ref;
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-border last:border-none"
                    >
                      <td className="py-3 pr-4 font-medium text-primary">
                        {booking.booking_ref}
                      </td>
                      <td className="py-3 pr-4 text-primary">
                        {booking.guest_name}
                      </td>
                      <td className="py-3 pr-4 text-primary">
                        {booking.rooms?.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {booking.check_in}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {booking.check_out}
                      </td>
                      <td className="py-3 pr-4 text-primary">{nights}</td>
                      <td className="py-3 pr-4 text-primary">
                        Rs {booking.total_amount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-primary">
                        Rs {booking.advance_amount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={booking.booking_status} />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          {booking.booking_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                disabled={isBusy}
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => updateStatus(booking.booking_ref, "confirm")}
                              >
                                {isBusy && pendingAction === "confirm" && <Spinner />}
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                disabled={isBusy}
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => updateStatus(booking.booking_ref, "reject")}
                              >
                                {isBusy && pendingAction === "reject" && <Spinner />}
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            render={
                              <Link href={`/dashboard/bookings/${booking.booking_ref}`} />
                            }
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
