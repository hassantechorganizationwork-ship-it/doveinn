import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Dove Inn Hotel. Call us, WhatsApp us, or fill out our contact form. We respond within 24 hours.",
};

const WHATSAPP_NUMBER = "923003901181";
const MAP_EMBED_SRC =
  "https://www.google.com/maps?q=31.4514767,74.2707378&z=17&output=embed";
// cid = Soft Inn Hotel's exact Google Place ID (converted from hex to decimal) —
// opens the real, labeled listing at the precise verified location.
const MAP_LINK = "https://www.google.com/maps?cid=10597146064902662880";
const MAP_DIRECTIONS_LINK =
  "https://www.google.com/maps/dir/?api=1&destination=31.4514767,74.2707378";

export default function ContactPage() {
  return (
    <div>
      {/* PAGE HEADER */}
      <section className="-mt-20 bg-primary pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl md:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold">Contact</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT COLUMN — CONTACT INFO */}
          <div>
            <h2 className="font-heading text-3xl text-primary">
              Get In Touch
            </h2>

            <div className="mt-8 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-gold" />
                <span className="text-primary">
                  +92 300 3901181 / 0324 0041300
                </span>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-gold"
              >
                <MessageCircle className="size-5 shrink-0 text-gold" />
                <span className="text-primary">WhatsApp: +92 300 3901181</span>
              </a>
              <div className="flex items-center gap-3">
                <Mail className="size-5 shrink-0 text-gold" />
                <span className="text-primary">
                  hassanshafiq03240041300@gmail.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="size-5 shrink-0 text-gold" />
                <span className="text-primary">
                  Sharaqpur Taiba Colony, Hazrat Ali Street, Pakistan
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-5 shrink-0 text-gold" />
                <span className="text-primary">
                  Check-in: 2:00 PM | Check-out: 12:00 PM
                </span>
              </div>
            </div>

            {/* MAP */}
            <div className="relative mt-8 h-64 overflow-hidden rounded-xl">
              <iframe
                src={MAP_EMBED_SRC}
                title="Dove Inn Hotel location"
                className="pointer-events-none h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Dove Inn Hotel location in Google Maps"
                className="absolute inset-0"
              />
            </div>

            <Button
              size="lg"
              className="mt-4 w-full bg-gold text-gold-foreground hover:bg-gold/90"
              render={
                <a
                  href={MAP_DIRECTIONS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Navigation className="size-4" />
              Locate on Google Maps
            </Button>
          </div>

          {/* RIGHT COLUMN — CONTACT FORM */}
          <div>
            <h2 className="font-heading text-3xl text-primary">
              Send a Message
            </h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
