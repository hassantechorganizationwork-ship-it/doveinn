"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type Room = {
  id: string | number;
  slug: string;
  name: string;
  type: "master" | "twin";
  price: number;
  capacity: number;
  amenities: string[];
};

const ROOM_IMAGES: Record<Room["type"], string> = {
  master: "/images/rooms/master-bedroom-1.jpg",
  twin: "/images/rooms/twin-room-1.jpg",
};

export function RoomCard({ room }: { room: Room }) {
  const [navigating, setNavigating] = useState(false);
  const visibleAmenities = room.amenities.slice(0, 3);
  const remaining = room.amenities.length - visibleAmenities.length;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-none py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={ROOM_IMAGES[room.type]}
          alt={room.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge
          className={cn(
            "absolute top-3 left-3 border-none",
            room.type === "master"
              ? "bg-gold text-gold-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {room.type === "master" ? "Master" : "Twin"}
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-heading text-lg font-bold text-primary">
            {room.name}
          </h3>
          <p className="mt-1 font-semibold text-gold-text">
            Rs {room.price.toLocaleString()} / night
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="size-4" />
            {room.capacity} Guests
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleAmenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {amenity}
            </span>
          ))}
          {remaining > 0 && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              +{remaining} more
            </span>
          )}
        </div>

        {/* mt-auto so the buttons line up across cards whose amenity rows
            wrap to different heights, instead of floating mid-card. */}
        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            disabled={navigating}
            onClick={() => setNavigating(true)}
            className="w-full sm:w-auto sm:flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            render={<Link href={`/rooms/${room.slug}`} />}
          >
            {navigating && <Spinner />}
            {navigating ? "Loading..." : "View Details"}
          </Button>
          <Button
            className="w-full sm:w-auto sm:flex-1 bg-gold text-gold-foreground hover:bg-gold/90"
            render={<Link href={`/booking?room=${room.slug}`} />}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
