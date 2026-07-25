import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RoomCard } from "@/components/rooms/RoomCard";
import { AmenityIcon } from "@/components/amenities/AmenityIcon";
import { getRooms } from "@/lib/supabase/rooms";
import { getAmenities } from "@/lib/supabase/amenities";

const ROOM_TYPES = [
  {
    name: "Master Bedroom",
    description:
      "Spacious king-size rooms with premium amenities for a luxurious stay. Perfect for couples and families.",
    price: "Starting from Rs 7,000 / night",
  },
  {
    name: "Twin Room",
    description:
      "Comfortable twin-bed rooms ideal for friends or colleagues traveling together.",
    price: "Starting from Rs 5,000 / night",
  },
];

// Revalidate this page in the background at most once a minute, so
// amenities added/edited/removed through the portal show up on the live
// site without needing a full redeploy.
export const revalidate = 60;

export default async function Home() {
  const rooms = await getRooms();
  const featuredRooms = rooms.filter((room) => room.type === "master").slice(0, 3);
  const amenities = await getAmenities();

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative -mt-20 flex min-h-screen items-center justify-center overflow-hidden">
        <Image
          src="/images/rooms/exterior-1.png"
          alt="Dove Inn Hotel"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/60" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
            Welcome to
          </p>
          <h1 className="mt-3 font-heading text-3xl text-primary-foreground sm:text-5xl md:text-7xl">
            Dove Inn Hotel
          </h1>
          <p className="mt-4 text-lg font-medium text-gold md:text-xl">
            Your Comfort, Our Priority
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90 sm:w-auto"
              render={<Link href="/rooms" />}
            >
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
              render={<Link href="/rooms" />}
            >
              View Rooms
            </Button>
          </div>
        </div>
      </section>

      {/* ROOM TYPES SECTION */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-20 lg:py-28">
        <h2 className="text-center font-heading text-3xl text-primary md:text-4xl">
          Our Rooms
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {ROOM_TYPES.map((room) => (
            <Card key={room.name} className="border-none shadow-sm">
              <CardHeader>
                <div className="flex size-14 items-center justify-center rounded-full bg-gold/10">
                  <BedDouble className="size-7 text-gold" />
                </div>
                <CardTitle className="mt-4 text-2xl">{room.name}</CardTitle>
                <CardDescription className="text-base">
                  {room.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-start gap-4">
                <p className="font-semibold text-primary">{room.price}</p>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  render={<Link href="/rooms" />}
                >
                  View Rooms
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURED ROOMS SECTION */}
      {featuredRooms.length > 0 && (
        <section className="bg-muted/40 py-12 md:py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center font-heading text-3xl text-primary md:text-4xl">
              Featured Rooms
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="bg-gold text-gold-foreground hover:bg-gold/90"
                render={<Link href="/rooms" />}
              >
                View All Rooms
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* AMENITIES SECTION */}
      {amenities.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12 md:py-20 lg:py-28">
          <h2 className="text-center font-heading text-3xl text-primary md:text-4xl">
            Hotel Amenities
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => (
              <Card key={amenity.id} className="border-none shadow-sm">
                <CardContent className="flex items-start gap-4 p-6">
                  <AmenityIcon icon={amenity.icon} className="mt-1 shrink-0" />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-primary">
                      {amenity.name}
                    </h3>
                    {amenity.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {amenity.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA BANNER SECTION */}
      <section className="bg-primary py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-3xl text-primary-foreground md:text-4xl">
            Ready for a Comfortable Stay?
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            Book your room today and experience true hospitality.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-gold text-gold-foreground hover:bg-gold/90"
            render={<Link href="/rooms" />}
          >
            Book Now
          </Button>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section className="bg-primary/95 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 text-center text-sm text-primary-foreground/80 sm:grid-cols-3">
          <div className="flex items-center justify-center gap-2">
            <Phone className="size-4 text-gold" />
            <span>+92 324 0041300</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Mail className="size-4 text-gold" />
            <span>hassanshafiq03240041300@gmail.com</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <MapPin className="size-4 text-gold" />
            <span>Taiba Colony, Hazrat Ali Street, Dove Inn Hotel, Sharaqpur Sharif</span>
          </div>
        </div>
      </section>
    </div>
  );
}
