"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BedDouble, CalendarDays, CheckCircle2, X } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { BookingWithRoom } from "@/lib/supabase/bookings";

function ConfirmedBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  if (searchParams.get("confirmed") !== "1" || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    router.replace("/account");
  };

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-800">
          Your email has been confirmed.
        </p>
        <p className="text-sm text-green-700">
          Welcome to Dove Inn Hotel — your account is ready to use.
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-green-600 hover:text-green-800"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function MyAccountContent() {
  const router = useRouter();

  // Shared with the Navbar via AuthContext, instead of this page running
  // its own separate getUser() call.
  const { user } = useAuth();
  const guest = user
    ? {
        name:
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "Guest",
        email: user.email ?? "",
      }
    : null;

  const [bookings, setBookings] = useState<BookingWithRoom[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/bookings");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load your bookings.");
      }
      setBookings(json.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <ConfirmedBanner />

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          {guest && (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold/15 font-heading text-lg text-gold-text">
              {guest.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-heading text-3xl text-primary">My Bookings</h1>
            {guest && (
              <p className="mt-1 text-sm text-muted-foreground">
                Logged in as{" "}
                <span className="font-medium text-primary">{guest.name}</span>{" "}
                ({guest.email})
              </p>
            )}
          </div>
        </div>

        {confirmingLogout ? (
          <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Log out?</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={loggingOut}
                onClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {loggingOut && <Spinner />}
                {loggingOut ? "Logging out..." : "Confirm"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={loggingOut}
                onClick={() => setConfirmingLogout(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setConfirmingLogout(true)}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Logout
          </Button>
        )}
      </div>

      <div className="mt-6 border-t border-border" />

      {/* LOADING STATE */}
      {loading && (
        <div className="mt-8 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-3 h-4 w-full max-w-sm" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            onClick={fetchBookings}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Retry
          </Button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && bookings?.length === 0 && (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-border bg-card py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-gold/10">
            <BedDouble className="size-7 text-gold-text" />
          </div>
          <p className="mt-4 text-muted-foreground">
            You don&apos;t have any bookings yet.
          </p>
          <Button
            className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90"
            render={<Link href="/rooms" />}
          >
            Browse Rooms
          </Button>
        </div>
      )}

      {/* SUCCESS STATE */}
      {!loading && !error && bookings && bookings.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {bookings.map((booking) => {
            const nights = differenceInCalendarDays(
              new Date(booking.check_out),
              new Date(booking.check_in)
            );
            return (
              <div
                key={booking.id}
                className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BedDouble className="size-4 text-gold-text" />
                    <p className="font-heading text-lg text-primary">
                      {booking.rooms?.name ?? "Room"}
                    </p>
                  </div>
                  <StatusBadge status={booking.booking_status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ref# {booking.booking_ref}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
                  <span className="flex items-center gap-1.5 text-primary">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    {format(new Date(booking.check_in), "d MMM yyyy")}
                    {" – "}
                    {format(new Date(booking.check_out), "d MMM yyyy")}
                  </span>
                  <span className="text-primary">
                    <span className="text-muted-foreground">Nights: </span>
                    {nights}
                  </span>
                  <span className="font-medium text-primary">
                    <span className="text-muted-foreground font-normal">
                      Total:{" "}
                    </span>
                    Rs {booking.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MyAccountPage() {
  return (
    <Suspense fallback={null}>
      <MyAccountContent />
    </Suspense>
  );
}
