import type { Metadata } from "next";
import Link from "next/link";
import { RoomsGrid } from "@/components/rooms/RoomsGrid";
import { getRooms } from "@/lib/supabase/rooms";

export const metadata: Metadata = {
  title: "Our Rooms",
  description:
    "Browse our 12 rooms — Master Bedrooms from Rs 7,000/night and Twin Rooms from Rs 5,000/night. All rooms include WiFi, AC, and attached bathroom.",
};

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div>
      {/* PAGE HEADER */}
      <section className="-mt-20 bg-primary pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl md:text-5xl">
            Our Rooms
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold">Rooms</span>
          </p>
        </div>
      </section>

      <RoomsGrid rooms={rooms} />
    </div>
  );
}
