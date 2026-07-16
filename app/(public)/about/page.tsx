import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Handshake, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Dove Inn Hotel — our story, values, and commitment to comfortable and affordable stays in Lahore, Pakistan.",
};

const VALUES = [
  {
    icon: Handshake,
    title: "Warm Hospitality",
    description:
      "Every guest is treated like family. Our staff is trained to go above and beyond.",
  },
  {
    icon: Sparkles,
    title: "Quality Comfort",
    description:
      "From premium bedding to spotless rooms, we maintain the highest standards.",
  },
  {
    icon: MapPin,
    title: "Prime Location",
    description:
      "Conveniently located with easy access to major landmarks and transport.",
  },
];

const QUICK_FACTS = [
  { label: "Established", value: "2024" },
  { label: "Total Rooms", value: "12" },
  { label: "Room Types", value: "Master Bedroom, Twin Room" },
  { label: "Check-in Time", value: "2:00 PM" },
  { label: "Check-out Time", value: "12:00 PM" },
  { label: "Languages Spoken", value: "Urdu, English" },
];

export default function AboutPage() {
  return (
    <div>
      {/* PAGE HEADER */}
      <section className="-mt-20 bg-primary pt-[7.5rem] pb-10 md:pt-[9rem] md:pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl md:text-5xl">
            About Us
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold">About</span>
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-20 lg:py-28">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="font-heading text-3xl text-primary md:text-4xl">
              Welcome to Dove Inn Hotel
            </h2>
            <p className="mt-5 text-muted-foreground">
              Dove Inn Hotel was established with a simple vision — to
              provide travelers with a warm, comfortable, and affordable
              place to stay without compromising on quality. Located in the
              heart of Lahore, we offer 12 elegantly appointed rooms designed
              to make every guest feel at home. Whether you&apos;re here for
              business or leisure, our dedicated team is committed to making
              your stay memorable.
            </p>
          </div>
          <div className="relative h-64 w-full overflow-hidden rounded-xl md:h-96">
            <Image
              src="/images/rooms/exterior-1.png"
              alt="Dove Inn Hotel exterior"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="bg-background py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-heading text-3xl text-primary md:text-4xl">
            Our Values
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="flex flex-col items-center rounded-xl border border-border p-6 text-center md:p-8"
              >
                <div className="flex size-16 items-center justify-center rounded-full bg-gold/10">
                  <value.icon className="size-8 text-gold" />
                </div>
                <h3 className="mt-4 font-heading text-xl text-primary">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="mx-auto max-w-4xl px-6 py-12 md:py-20 lg:py-28">
        <h2 className="text-center font-heading text-3xl text-primary md:text-4xl">
          Quick Facts
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
          {QUICK_FACTS.map((fact) => (
            <div
              key={fact.label}
              className="flex items-center justify-between border-b border-border pb-3"
            >
              <span className="font-medium text-primary">{fact.label}</span>
              <span className="text-sm text-muted-foreground">
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-primary py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-3xl text-primary-foreground md:text-4xl">
            Experience Dove Inn for Yourself
          </h2>
          <Button
            size="lg"
            className="mt-8 bg-gold text-gold-foreground hover:bg-gold/90"
            render={<Link href="/rooms" />}
          >
            Book a Room
          </Button>
        </div>
      </section>
    </div>
  );
}
