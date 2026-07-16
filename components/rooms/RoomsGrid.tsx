"use client";

import { useState } from "react";
import { RoomCard, type Room } from "@/components/rooms/RoomCard";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All Rooms" },
  { key: "master", label: "Master Bedrooms" },
  { key: "twin", label: "Twin Rooms" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export function RoomsGrid({ rooms }: { rooms: Room[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredRooms =
    filter === "all" ? rooms : rooms.filter((room) => room.type === filter);

  return (
    <>
      {/* FILTER TABS */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div className="flex flex-wrap gap-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-all active:scale-95",
                filter === f.key
                  ? "bg-gold text-gold-foreground"
                  : "border border-border text-primary hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ROOMS GRID */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {filteredRooms.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No rooms available right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
