import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoomCard, type Room } from "@/components/rooms/RoomCard";
import { BookingSidebar } from "@/components/rooms/BookingSidebar";
import { getRoomBySlug, getRoomSlugs, getRooms } from "@/lib/supabase/rooms";

const ROOM_GALLERY: Record<Room["type"], string[]> = {
  master: [
    "/images/rooms/master-bedroom-1.jpg",
    "/images/rooms/master-bedroom-2.jpg",
    "/images/rooms/master-bedroom-3.png",
    "/images/rooms/bathroom-1.jpg",
  ],
  twin: [
    "/images/rooms/twin-room-1.jpg",
    "/images/rooms/twin-room-2.png",
    "/images/rooms/bathroom-1.jpg",
    "/images/rooms/bathroom-2.jpg",
  ],
};

const DESCRIPTIONS: Record<Room["type"], string> = {
  master:
    "A spacious and elegantly furnished master bedroom featuring a king-size bed, premium linens, and all modern amenities for a truly comfortable stay.",
  twin: "A well-appointed twin room with two comfortable single beds, ideal for friends or colleagues traveling together.",
};

const POLICIES = [
  { label: "Check-in", value: "2:00 PM" },
  { label: "Check-out", value: "12:00 PM" },
  { label: "Advance Payment", value: "30% required at booking" },
  { label: "Cancellation", value: "Contact hotel 24 hours before check-in" },
];

export async function generateStaticParams() {
  const slugs = await getRoomSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    return { title: "Room Not Found" };
  }

  const description = `${DESCRIPTIONS[room.type]} Sleeps up to ${room.capacity} guests, from Rs ${room.price.toLocaleString()}/night at Dove Inn Hotel.`;

  return {
    title: room.name,
    description,
    openGraph: {
      title: `${room.name} | Dove Inn Hotel`,
      description,
      images: [{ url: ROOM_GALLERY[room.type][0] }],
    },
  };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center md:py-32">
        <h1 className="font-heading text-3xl text-primary">Room not found</h1>
        <p className="mt-3 text-muted-foreground">
          The room you&apos;re looking for doesn&apos;t exist or may have been
          removed.
        </p>
        <Button
          className="mt-8 bg-gold text-gold-foreground hover:bg-gold/90"
          render={<Link href="/rooms" />}
        >
          Back to Rooms
        </Button>
      </div>
    );
  }

  const gallery = ROOM_GALLERY[room.type];
  const image = gallery[0];
  const thumbnails = gallery.slice(1, 4);
  const allRooms = await getRooms();
  const similarRooms = allRooms
    .filter((r) => r.slug !== room.slug && r.type === room.type)
    .slice(0, 3);
  const fillerRooms =
    similarRooms.length < 3
      ? allRooms
          .filter(
            (r) => r.slug !== room.slug && !similarRooms.includes(r)
          )
          .slice(0, 3 - similarRooms.length)
      : [];
  const roomsToShow = [...similarRooms, ...fillerRooms];

  return (
    <div>
      {/* BREADCRUMB */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <Link href="/rooms" className="hover:text-gold">
              Rooms
            </Link>
            <span>/</span>
            <span className="text-gold-text">{room.name}</span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          {/* LEFT COLUMN */}
          <div>
            {/* IMAGE SECTION */}
            <div className="relative h-56 w-full overflow-hidden rounded-xl sm:h-72 md:h-[420px]">
              <Image
                src={image}
                alt={room.name}
                fill
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {thumbnails.map((thumb, i) => (
                <div
                  key={thumb + i}
                  className="relative h-20 w-full overflow-hidden rounded-lg md:h-28"
                >
                  <Image
                    src={thumb}
                    alt={`${room.name} thumbnail ${i + 1}`}
                    fill
                    sizes="(max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* ROOM INFO */}
            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-3xl text-primary md:text-4xl">
                  {room.name}
                </h1>
                <Badge className="border-none bg-gold text-gold-foreground">
                  {room.type === "master" ? "Master" : "Twin"}
                </Badge>
              </div>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                {DESCRIPTIONS[room.type]}
              </p>
              <p className="mt-4 flex items-center gap-2 font-medium text-primary">
                <Users className="size-5 text-gold" />
                Up to {room.capacity} Guests
              </p>
            </div>

            {/* AMENITIES */}
            <div className="mt-10">
              <h2 className="font-heading text-2xl text-primary">
                Room Amenities
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-gold" />
                    <span className="text-sm text-primary">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HOTEL POLICIES */}
            <div className="mt-10">
              <h2 className="font-heading text-2xl text-primary">
                Hotel Policies
              </h2>
              <div className="mt-5 space-y-3">
                {POLICIES.map((policy) => (
                  <div
                    key={policy.label}
                    className="flex flex-col justify-between gap-1 border-b border-border pb-3 sm:flex-row sm:items-center"
                  >
                    <span className="font-medium text-primary">
                      {policy.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {policy.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/*
            RIGHT COLUMN — BOOKING SIDEBAR
            Sticky on desktop: the left column is far taller, so a static
            sidebar scrolls away and leaves the whole right side empty for
            most of the page — keeping the price and date pickers in view
            means the booking action is always one click away.
          */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BookingSidebar room={room} />
          </div>
        </div>

        {/* SIMILAR ROOMS */}
        {roomsToShow.length > 0 && (
          <div className="mt-20">
            <h2 className="font-heading text-3xl text-primary">
              You May Also Like
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {roomsToShow.map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
