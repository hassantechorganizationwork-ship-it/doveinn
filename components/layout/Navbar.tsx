"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/gallery", label: "Gallery" },
  { href: "/currency", label: "Currency" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountHref, setAccountHref] = useState("/account/login");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setAccountHref(data.user ? "/account" : "/account/login");
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAccountHref(session?.user ? "/account" : "/account/login");
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  // Every page starts with a transparent navbar sitting on top of that
  // page's own dark header block, so there's no visible seam — it only
  // turns solid once you scroll past that block.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Close the mobile menu whenever the route actually changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const solid = scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-300",
        solid ? "bg-primary" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-heading text-2xl tracking-wide text-gold"
        >
          Dove Inn
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-foreground/90 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={accountHref}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-gold"
          >
            <User className="size-4" />
            My Bookings
          </Link>
          <WhatsAppButton />
          <Button
            className="bg-gold text-gold-foreground hover:bg-gold/90"
            render={<Link href="/rooms" />}
          >
            Book Now
          </Button>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className="text-primary-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-background">
            <SheetHeader>
              <SheetTitle className="font-heading text-xl text-primary">
                Dove Inn
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-6 px-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={accountHref}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-base font-medium text-primary"
              >
                <User className="size-5" />
                My Bookings
              </Link>
              <Button
                className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90"
                render={<Link href="/rooms" onClick={() => setMenuOpen(false)} />}
              >
                Book Now
              </Button>
              <div className="mt-2 flex items-center gap-2">
                <WhatsAppButton />
                <span className="text-sm font-medium text-primary">
                  Chat with us on WhatsApp
                </span>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
