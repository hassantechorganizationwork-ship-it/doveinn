"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Room } from "@/components/rooms/RoomCard";

const WHATSAPP_NUMBER = "923003901181";

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.7.44 3.36 1.28 4.82L2 22l5.4-1.42a9.9 9.9 0 0 0 4.64 1.18h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2Zm0 1.67c2.24 0 4.35.87 5.93 2.46a8.23 8.23 0 0 1 2.42 5.84c0 4.55-3.7 8.25-8.36 8.25a8.3 8.3 0 0 1-4.22-1.15l-.3-.18-3.2.84.85-3.12-.2-.32a8.19 8.19 0 0 1-1.26-4.4c0-4.56 3.71-8.22 8.34-8.22Zm-4.42 4.55c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03s.87 2.36.99 2.52c.12.16 1.68 2.7 4.19 3.68 2.08.82 2.5.66 2.95.61.45-.04 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.78.97-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.22-.72-.65-1.21-1.44-1.35-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.36-.77-1.86-.2-.48-.4-.42-.55-.42h-.47Z" />
    </svg>
  );
}

export function BookingSidebar({ room }: { room: Room }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const nights =
    checkIn && checkOut
      ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
      : 0;

  const showSummary = checkIn && checkOut && nights > 0;
  const total = showSummary ? nights * room.price : 0;
  const advance = Math.round(total * 0.3);
  const remaining = total - advance;

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }
    router.push(`/booking?room=${room.slug}&checkin=${checkIn}&checkout=${checkOut}`);
  };

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-3xl text-gold">
            Rs {room.price.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">per night</span>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="checkin">Check-in</Label>
            <Input
              id="checkin"
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="checkout">Check-out</Label>
            <Input
              id="checkout"
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        {showSummary && (
          <div className="mt-6 space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nights</span>
              <span className="font-medium text-primary">{nights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium text-primary">
                Rs {total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advance to Pay (30%)</span>
              <span className="font-medium text-gold">
                Rs {advance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining at Hotel</span>
              <span className="font-medium text-primary">
                Rs {remaining.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleBookNow}
          size="lg"
          className="mt-6 w-full bg-gold text-gold-foreground hover:bg-gold/90"
        >
          Book Now
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="mt-3 w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
          render={
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <WhatsAppIcon className="size-4" />
          Enquire on WhatsApp
        </Button>
      </div>
    </div>
  );
}
