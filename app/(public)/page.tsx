import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  BedDouble,
  Clock,
  MapPin,
  Phone,
  Mail,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RoomCard } from "@/components/rooms/RoomCard";
import { getRooms } from "@/lib/supabase/rooms";

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

const FEATURES = [
  {
    icon: Wifi,
    title: "Free WiFi",
    description: "Stay connected with high-speed internet throughout.",
  },
  {
    icon: Clock,
    title: "24/7 Reception",
    description: "Our front desk is here for you around the clock.",
  },
  {
    icon: MapPin,
    title: "Prime Location",
    description: "Steps away from the city's best attractions.",
  },
  {
    icon: BadgeCheck,
    title: "Best Rates",
    description: "Quality comfort at prices that make sense.",
  },
];

export default async function Home() {
  const rooms = await getRooms();
  const featuredRooms = rooms.filter((room) => room.type === "master").slice(0, 3);

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
        <section className="bg-background py-12 md:py-20 lg:py-28">
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

      {/* WHY CHOOSE US SECTION */}
      <section className="bg-background py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-heading text-3xl text-primary md:text-4xl">
            Why Choose Dove Inn?
          </h2>

          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-gold/10">
                  <feature.icon className="size-8 text-gold" />
                </div>
                <h3 className="mt-4 font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            <span>+92 300 3901181</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Mail className="size-4 text-gold" />
            <span>info@doveinn.pk</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <MapPin className="size-4 text-gold" />
            <span>R1 Block, Johar Town, Lahore, 54600</span>
          </div>
        </div>
      </section>
    </div>
  );
}
