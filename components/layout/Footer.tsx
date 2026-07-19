import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          <div>
            <h3 className="font-heading text-2xl text-gold">Dove Inn Hotel</h3>
            <p className="mt-3 max-w-xs text-sm text-primary-foreground/70">
              A boutique retreat offering quiet comfort and warm hospitality
              in the heart of the city.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gold">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gold">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/70">
              <li>+92 324 0041300</li>
              <li>hassanshafiq03240041300@gmail.com</li>
              <li>
                Taiba Colony, Hazrat Ali Street, Dove Inn Hotel, Sharaqpur
                Sharif
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-primary-foreground/10" />

        <p className="text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Dove Inn Hotel. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
