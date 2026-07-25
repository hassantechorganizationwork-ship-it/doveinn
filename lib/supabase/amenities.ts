import { createClient } from "@/lib/supabase/public";

export type Amenity = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

export async function getAmenities(): Promise<Amenity[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("amenities")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}
