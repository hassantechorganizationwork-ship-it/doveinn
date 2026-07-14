import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingDetail } from "@/components/portal/BookingDetail";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingWithRoom } from "@/lib/supabase/bookings";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, rooms(*)")
    .eq("booking_ref", ref)
    .single();

  if (!data) {
    return (
      <div className="p-6 md:p-10">
        <h1 className="font-heading text-2xl text-primary">
          Booking not found
        </h1>
        <Button
          className="mt-6 bg-gold text-gold-foreground hover:bg-gold/90"
          render={<Link href="/dashboard/bookings" />}
        >
          Back to Bookings
        </Button>
      </div>
    );
  }

  return <BookingDetail booking={data as BookingWithRoom} />;
}
