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

function mapDbRoom(row: DbRoom): Room {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    price: row.price_per_night,
    capacity: row.capacity,
    amenities: row.amenities,
  };
}

export async function getRooms(): Promise<Room[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("type");

  return (data ?? []).map(mapDbRoom);
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

  return data ? mapDbRoom(data) : null;
});

export async function getRoomSlugs(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("rooms")
    .select("slug")
    .eq("is_active", true);

  return (data ?? []).map((row) => row.slug);
}
