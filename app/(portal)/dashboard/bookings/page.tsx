import { BookingsTable } from "@/components/portal/BookingsTable";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingWithRoom } from "@/lib/supabase/bookings";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, rooms(name, type)")
    .order("created_at", { ascending: false });

  return <BookingsTable bookings={(data ?? []) as BookingWithRoom[]} />;
}
