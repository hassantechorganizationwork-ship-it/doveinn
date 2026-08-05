"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, differenceInCalendarDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { createClient } from "@/lib/supabase/client";
import type { Room } from "@/components/rooms/RoomCard";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
  specialRequests: string;
};

type FormErrors = Partial<Record<"fullName" | "email" | "phone", string>>;

function InvalidState({ message }: { message: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center md:py-32">
      <h1 className="font-heading text-2xl text-primary">{message}</h1>
      <Button
        className="mt-8 bg-gold text-gold-foreground hover:bg-gold/90"
        render={<Link href="/rooms" />}
      >
        Back to Rooms
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="size-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading room details...</p>
    </div>
  );
}

function BookingFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    cnic: "",
    specialRequests: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);

  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const roomSlug = searchParams.get("room");
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");

  useEffect(() => {
    if (!roomSlug) {
      setRoomLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("rooms")
      .select("*")
      .eq("slug", roomSlug)
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        if (data) {
          setRoom({
            id: data.id,
            slug: data.slug,
            name: data.name,
            type: data.type,
            price: data.price_per_night,
            capacity: data.capacity,
            amenities: data.amenities,
          });
        }
        setRoomLoading(false);
      });
  }, [roomSlug]);

  const todayStr = new Date().toISOString().split("T")[0];

  if (!checkin || !checkout) {
    return <InvalidState message="Please select dates first" />;
  }
  if (checkin < todayStr) {
    return <InvalidState message="Invalid dates" />;
  }
  if (!roomSlug) {
    return <InvalidState message="Invalid room selected" />;
  }
  if (roomLoading) {
    return <LoadingState />;
  }
  if (!room) {
    return <InvalidState message="Invalid room selected" />;
  }

  const nights = Math.max(
    differenceInCalendarDays(new Date(checkout), new Date(checkin)),
    0
  );
  const total = nights * room.price;
  const advance = Math.round(total * 0.3);
  const remaining = total - advance;

  const formatDate = (dateStr: string) =>
    format(new Date(dateStr), "EEEE, d MMM yyyy");

  const validateStep1 = () => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateStep1()) return;

    setAvailabilityChecking(true);
    setAvailabilityError(null);

    try {
      const res = await fetch(
        `/api/availability?room_id=${room.id}&check_in=${checkin}&check_out=${checkout}`
      );
      const { available } = await res.json();

      if (!available) {
        setAvailabilityError(
          "Sorry, this room is not available for the selected dates. Please go back and choose different dates."
        );
      } else {
        setStep(2);
      }
    } catch {
      setAvailabilityError(
        "Something went wrong while checking availability. Please try again."
      );
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const handleConfirmPay = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: room.id,
          guest_name: formData.fullName,
          guest_email: formData.email,
          guest_phone: formData.phone,
          guest_cnic: formData.cnic || null,
          check_in: checkin,
          check_out: checkout,
          total_amount: total,
          advance_amount: advance,
          special_requests: formData.specialRequests || null,
        }),
      });
      const result = await res.json();

      if (result.success) {
        router.push(
          `/booking/confirmation?ref=${result.booking_ref}&room=${room.slug}&name=${encodeURIComponent(
            formData.fullName
          )}&advance=${advance}`
        );
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <h1 className="text-center font-heading text-3xl text-primary md:text-4xl">
        Complete Your Booking
      </h1>

      <div className="mt-8">
        <StepIndicator current={step} />
      </div>

      {/* STEP 1 — GUEST DETAILS */}
      {step === 1 && (
        <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {availabilityError ? (
            <div className="flex flex-col items-center text-center">
              <h2 className="font-heading text-xl text-primary">
                Room Unavailable
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {availabilityError}
              </p>
              <Button
                className="mt-6 bg-gold text-gold-foreground hover:bg-gold/90"
                render={<Link href="/rooms" />}
              >
                Back to Rooms
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-2xl text-primary">
                Guest Details
              </h2>

              <div className="mt-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="e.g. Ahmed Khan"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="e.g. ahmed@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="03XX-XXXXXXX"
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cnic">CNIC (optional)</Label>
                  <Input
                    id="cnic"
                    value={formData.cnic}
                    onChange={(e) =>
                      setFormData({ ...formData, cnic: e.target.value })
                    }
                    placeholder="XXXXX-XXXXXXX-X"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="specialRequests">
                    Special Requests (optional)
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialRequests: e.target.value,
                      })
                    }
                    placeholder="Let us know if you have any special requirements"
                  />
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleContinue}
                disabled={availabilityChecking}
                className="mt-8 w-full bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {availabilityChecking && <Spinner />}
                {availabilityChecking ? "Checking availability..." : "Continue to Summary"}
              </Button>
            </>
          )}
        </div>
      )}

      {/* STEP 2 — BOOKING SUMMARY */}
      {step === 2 && (
        <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-2xl text-primary">
              {room.name}
            </h2>
            <Badge className="border-none bg-gold text-gold-foreground">
              {room.type === "master" ? "Master" : "Twin"}
            </Badge>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in</span>
              <span className="font-medium text-primary">
                {formatDate(checkin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out</span>
              <span className="font-medium text-primary">
                {formatDate(checkout)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nights</span>
              <span className="font-medium text-primary">{nights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per Night</span>
              <span className="font-medium text-primary">
                Rs {room.price.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-medium text-primary">
                  Rs {total.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">
                  Advance to Pay (30%)
                </span>
                <span className="font-bold text-gold-text">
                  Rs {advance.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">
                  Remaining at Hotel
                </span>
                <span className="font-medium text-primary">
                  Rs {remaining.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="mb-2 font-medium text-primary">Guest Details</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="text-primary">{formData.fullName}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-primary">{formData.email}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="text-primary">{formData.phone}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setStep(1)}
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground sm:w-auto"
            >
              Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep(3)}
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90 sm:flex-1"
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — PAYMENT (manual bank transfer, confirmed by manager) */}
      {step === 3 && (
        <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="font-heading text-2xl text-primary">
            Pay Advance Amount
          </h2>
          <p className="mt-2 font-heading text-4xl text-gold-text">
            Rs {advance.toLocaleString()}
          </p>

          <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
            Your booking will be confirmed after the manager reviews your
            payment. You will receive a call/WhatsApp confirmation within 2-4
            hours.
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            After confirming, you&apos;ll receive bank transfer details to
            complete your advance payment.
          </p>

          {submitError && (
            <p className="mt-4 text-sm text-destructive">{submitError}</p>
          )}

          <Button
            size="lg"
            onClick={handleConfirmPay}
            disabled={submitting}
            className="mt-8 w-full bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {submitting && <Spinner />}
            {submitting ? "Processing..." : `Confirm & Pay Rs ${advance.toLocaleString()}`}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setStep(2)}
            disabled={submitting}
            className="mt-3 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingFlow />
    </Suspense>
  );
}
