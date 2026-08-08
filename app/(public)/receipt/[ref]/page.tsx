"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Download, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/portal/StatusBadge";
import type { BookingWithRoom } from "@/lib/supabase/bookings";

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Not Paid Yet",
  advance_paid: "Advance Paid",
  fully_paid: "Fully Paid",
  refunded: "Refunded",
};

export default function ReceiptPage() {
  const params = useParams<{ ref: string }>();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [booking, setBooking] = useState<BookingWithRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/bookings/${encodeURIComponent(params.ref)}?email=${encodeURIComponent(email)}`
        );
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) {
          setError(json.error ?? "Receipt not found.");
          return;
        }
        setBooking(json.data);
      } catch {
        if (!cancelled) setError("Something went wrong loading this receipt.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.ref, email]);

  const loadImageAsDataUrl = async (src: string): Promise<string> => {
    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDownload = async () => {
    if (!booking) return;
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const nights = differenceInCalendarDays(
        new Date(booking.check_out),
        new Date(booking.check_in)
      );
      const remainingDue = booking.total_amount - booking.advance_amount;
      const isFullyPaid = booking.payment_status === "fully_paid";

      const gold: [number, number, number] = [138, 109, 31];
      const green: [number, number, number] = [21, 128, 61];
      const ink: [number, number, number] = [28, 28, 28];
      const grey: [number, number, number] = [123, 116, 102];

      let y = 66;
      try {
        const logoDataUrl = await loadImageAsDataUrl("/images/brand/logo-dark.png");
        // Source is 1538x1022 (~1.5:1) — rendered at a fixed width so it
        // stays crisp without distorting the aspect ratio.
        doc.addImage(logoDataUrl, "PNG", 48, 32, 96, 63.7);
      } catch {
        // If the logo fails to load (e.g. offline), fall back to text so
        // the receipt still generates instead of throwing.
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...ink);
        doc.text("Dove Inn Hotel", 48, y);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...grey);
      doc.text("Booking Receipt", 400, 50, { align: "right" });
      doc.text(
        isFullyPaid ? "Status: Fully Paid" : "Status: Advance Received",
        400,
        66,
        { align: "right" }
      );

      y = 115;
      doc.setDrawColor(...gold);
      doc.setLineWidth(1.2);
      doc.line(48, y, 547, y);

      const row = (label: string, value: string, bold = false, color = ink) => {
        y += 26;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...grey);
        doc.text(label, 48, y);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(...color);
        doc.text(value, 547, y, { align: "right" });
      };

      y += 20;
      row("Booking Reference", booking.booking_ref, true);
      row("Guest Name", booking.guest_name);
      row("Room", booking.rooms?.name ?? "—");
      row("Check-in", booking.check_in);
      row("Check-out", booking.check_out);
      row("Nights", String(nights));
      row("Booking Status", booking.booking_status.replace("_", " "));

      y += 14;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(48, y, 547, y);

      row("Total Amount", `Rs ${booking.total_amount.toLocaleString()}`);
      row("Advance Paid (bank transfer)", `Rs ${booking.advance_amount.toLocaleString()}`);
      if (isFullyPaid) {
        row("Remaining Paid (cash at hotel)", `Rs ${remainingDue.toLocaleString()}`);
      }

      y += 14;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(48, y, 547, y);

      row(
        isFullyPaid ? "Total Paid" : "Remaining (payable at hotel)",
        `Rs ${(isFullyPaid ? booking.total_amount : remainingDue).toLocaleString()}`,
        true,
        isFullyPaid ? green : ink
      );
      row(
        "Payment Status",
        PAYMENT_LABELS[booking.payment_status] ?? booking.payment_status,
        true,
        isFullyPaid ? green : ink
      );

      y += 50;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...grey);
      doc.text(
        "Taiba Colony, Hazrat Ali Street, Dove Inn Hotel, Sharaqpur Sharif",
        48,
        y
      );

      doc.save(`Dove-Inn-Receipt-${booking.booking_ref}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <section className="-mt-20 bg-primary pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl">
            Booking Receipt
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-10 md:py-16">
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-border bg-card py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && booking && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-gold/10">
                  <BedDouble className="size-5 text-gold-text" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ref# {booking.booking_ref}
                  </p>
                  <h2 className="font-heading text-xl text-primary">
                    {booking.rooms?.name ?? "Room"}
                  </h2>
                </div>
              </div>
              <StatusBadge status={booking.booking_status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Guest</p>
                <p className="mt-1 font-medium text-primary">{booking.guest_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Check-in</p>
                <p className="mt-1 font-medium text-primary">{booking.check_in}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Check-out</p>
                <p className="mt-1 font-medium text-primary">{booking.check_out}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="mt-1 font-medium text-primary">
                  Rs {booking.total_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Advance Paid</p>
                <p className="mt-1 font-medium text-gold-text">
                  Rs {booking.advance_amount.toLocaleString()}
                </p>
              </div>
              {booking.payment_status === "fully_paid" && (
                <div>
                  <p className="text-muted-foreground">Remaining Paid (cash)</p>
                  <p className="mt-1 font-medium text-green-600">
                    Rs {(booking.total_amount - booking.advance_amount).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Payment Status</p>
                <p
                  className={`mt-1 font-medium ${
                    booking.payment_status === "fully_paid"
                      ? "text-green-600"
                      : "text-primary"
                  }`}
                >
                  {PAYMENT_LABELS[booking.payment_status] ?? booking.payment_status}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              disabled={downloading}
              onClick={handleDownload}
              className="mt-8 w-full bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {downloading ? <Spinner /> : <Download className="size-4" />}
              {downloading ? "Preparing PDF..." : "Download PDF Receipt"}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
