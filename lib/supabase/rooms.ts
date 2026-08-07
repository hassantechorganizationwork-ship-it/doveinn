import { cache } from "react";
import { createClient } from "@/lib/supabase/public";
import type { Room } from "@/components/rooms/RoomCard";

type DbRoom = {
  id: string;
  name: string;
  slug: string;
  type: "master" | "twin";
  description: string | null;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  images: string[];
  is_active: boolean;
};

function mapDbRoom(row: DbRoom, bookedToday: boolean): Room {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    price: row.price_per_night,
    capacity: row.capacity,
    amenities: row.amenities,
    bookedToday,
  };
}

// Real-time status for "is this room occupied right now" — separate from
// is_active (which just means "listed in the catalog at all"). A room is
// counted as booked today if any row in room_availability blocks today's
// date; those rows only exist once a manager confirms a booking, so a
// merely-pending request never shows a room as unavailable.
async function todaysBlockedRoomIds(
  supabase: ReturnType<typeof createClient>
): Promise<Set<string>> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("room_availability")
    .select("room_id")
    .eq("blocked_date", today);

  return new Set((data ?? []).map((row) => row.room_id as string));
}

export async function getRooms(): Promise<Room[]> {
  const supabase = createClient();
  const [{ data }, blockedIds] = await Promise.all([
    supabase.from("rooms").select("*").eq("is_active", true).order("type"),
    todaysBlockedRoomIds(supabase),
  ]);

  return (data ?? []).map((row) => mapDbRoom(row, blockedIds.has(row.id)));
}

// Wrapped in React's cache() so generateMetadata and the page component
// (which both need the same room) share a single request-scoped DB call
// instead of querying Supabase twice per page load.
export const getRoomBySlug = cache(async (slug: string): Promise<Room | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;

  const blockedIds = await todaysBlockedRoomIds(supabase);
  return mapDbRoom(data, blockedIds.has(data.id));
});

export async function getRoomSlugs(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("rooms")
    .select("slug")
    .eq("is_active", true);

  return (data ?? []).map((row) => row.slug);
}
