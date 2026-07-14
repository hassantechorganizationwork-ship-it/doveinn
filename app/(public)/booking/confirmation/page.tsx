"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const WHATSAPP_NUMBER = "923003901181";

function ConfirmationContent() {
  const searchParams = useSearchParams();

  const ref = searchParams.get("ref") ?? "DI-2024-001";
  const roomSlug = searchParams.get("room");
  const name = searchParams.get("name") ?? "Guest";
  const advance = Number(searchParams.get("advance") ?? 0);

  const [roomName, setRoomName] = useState<string | null>(null);

  useEffect(() => {
    if (!roomSlug) return;
    const supabase = createClient();
    supabase
      .from("rooms")
      .select("name")
      .eq("slug", roomSlug)
      .single()
      .then(({ data }) => {
        if (data) setRoomName(data.name);
      });
  }, [roomSlug]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center md:py-28">
      <CircleCheck className="size-16 text-green-600" />

      <h1 className="mt-6 font-heading text-3xl text-primary md:text-4xl">
        Booking Request Received!
      </h1>

      <div className="mt-8 w-full rounded-xl border border-border bg-card p-6 text-left shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Booking Ref</span>
          <span className="font-semibold text-primary">{ref}</span>
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-muted-foreground">Guest Name</span>
          <span className="font-semibold text-primary">{name}</span>
        </div>
        {roomName && (
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Room</span>
            <span className="font-semibold text-primary">{roomName}</span>
          </div>
        )}
      </div>

      <p className="mt-6 text-muted-foreground">
        Your booking is under review. Our team will contact you within 2-4
        hours to confirm your reservation.
      </p>

      {/* PAYMENT INSTRUCTIONS */}
      <div className="mt-10 w-full text-left">
        <h2 className="font-heading text-2xl text-primary">
          Complete Your Booking
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          To confirm your reservation, please send 30% advance payment via
          bank transfer:
        </p>

        <div className="mt-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bank</span>
            <span className="font-medium text-primary">Meezan Bank</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Account Title</span>
            <span className="font-medium text-primary">Dove Inn Hotel</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Account Number</span>
            <span className="font-medium text-primary">XXXX-XXXX-XXXX</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Amount to Send</span>
            <span className="font-bold text-gold">
              Rs {advance.toLocaleString()}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          After payment, send screenshot on WhatsApp:
        </p>
      </div>

      <Button
        size="lg"
        className="mt-4 w-full bg-[#25D366] text-white hover:bg-[#25D366]/90"
        render={
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
          />
        }
      >
        Chat with us on WhatsApp
      </Button>

      <p className="mt-4 text-xs text-muted-foreground">
        Your booking will be confirmed within 2-4 hours after payment
        verification.
      </p>

      <Button
        size="lg"
        variant="outline"
        className="mt-6 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        render={<Link href="/" />}
      >
        Back to Home
      </Button>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}
