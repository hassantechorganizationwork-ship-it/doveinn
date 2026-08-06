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
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// These pages have a plain white background right from the top, with no
// dark hero image behind the navbar — so the transparent/white-text state
// would render invisible on them. Force the solid bar there instead.
const LIGHT_BACKGROUND_ROUTES = [
  "/account",
  "/booking",
];

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

  // Shared with the My Bookings page via AuthContext, instead of each
  // component running its own getUser()/onAuthStateChange pair.
  const { user } = useAuth();
  const accountHref = user ? "/account" : "/account/login";
  const guestInitial =
    typeof user?.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim().charAt(0).toUpperCase()
      : user?.email?.charAt(0).toUpperCase();

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

  const forcedSolid = LIGHT_BACKGROUND_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const solid = scrolled || forcedSolid;

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
          <div className="group relative">
            <Link
              href={accountHref}
              className="flex items-center gap-2 rounded-full border border-primary-foreground/25 px-3.5 py-1.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:border-gold hover:text-gold"
            >
              {user ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold text-[11px] font-semibold text-gold-foreground">
                  {guestInitial}
                </span>
              ) : (
                <User className="size-4" />
              )}
              {user ? "My Bookings" : "Login"}
            </Link>

            {user && (
              <div
                role="tooltip"
                className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground opacity-0 shadow-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
              >
                You&apos;re logged in as {user.email}
                <div className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-primary" />
              </div>
            )}
          </div>
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
                {user ? (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold-text">
                    {guestInitial}
                  </span>
                ) : (
                  <User className="size-5" />
                )}
                {user ? "My Bookings" : "Login"}
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
