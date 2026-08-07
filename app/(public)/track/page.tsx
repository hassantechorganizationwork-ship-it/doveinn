"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/portal/StatusBadge";
import type { BookingWithRoom } from "@/lib/supabase/bookings";

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Not Paid Yet",
  advance_paid: "Advance Paid",
  fully_paid: "Fully Paid",
  refunded: "Refunded",
};

function TrackBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ref, setRef] = useState(searchParams.get("ref") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [booking, setBooking] = useState<BookingWithRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ref.trim() || !email.trim()) {
      setError("Enter both your booking reference and email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(ref.trim())}?email=${encodeURIComponent(email.trim())}`
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBooking(null);
        setError(json.error ?? "No booking found with that reference and email.");
        return;
      }
      setBooking(json.data);
      router.replace(
        `/track?ref=${encodeURIComponent(ref.trim())}&email=${encodeURIComponent(email.trim())}`
      );
    } catch {
      setBooking(null);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nights = booking
    ? differenceInCalendarDays(new Date(booking.check_out), new Date(booking.check_in))
    : 0;

  return (
    <div>
      <section className="-mt-20 bg-primary pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl md:text-5xl">
            Track Your Booking
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold">Track Booking</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10 md:py-16">
        <form
          onSubmit={lookup}
          className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
          <p className="text-sm text-muted-foreground">
            Enter your booking reference and the email you booked with — this
            checks live against our system, so it always reflects the
            current status.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ref">Booking Reference</Label>
              <Input
                id="ref"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. DI-471579"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="mt-5 w-full bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {loading ? <Spinner /> : <Search className="size-4" />}
            {loading ? "Checking..." : "Check Status"}
          </Button>
        </form>

        {!loading && searched && booking && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Ref# {booking.booking_ref}
                </p>
                <h2 className="mt-1 font-heading text-2xl text-primary">
                  {booking.rooms?.name ?? "Room"}
                </h2>
              </div>
              <StatusBadge status={booking.booking_status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Check-in</p>
                <p className="mt-1 font-medium text-primary">{booking.check_in}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Check-out</p>
                <p className="mt-1 font-medium text-primary">{booking.check_out}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nights</p>
                <p className="mt-1 font-medium text-primary">{nights}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment</p>
                <p className="mt-1 font-medium text-primary">
                  {PAYMENT_LABELS[booking.payment_status] ?? booking.payment_status}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="mt-6 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              render={
                <Link
                  href={`/receipt/${booking.booking_ref}?email=${encodeURIComponent(booking.guest_email)}`}
                />
              }
            >
              <FileText className="size-4" />
              View / Download Receipt
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function TrackBookingPage() {
  return (
    <Suspense fallback={null}>
      <TrackBookingContent />
    </Suspense>
  );
}
