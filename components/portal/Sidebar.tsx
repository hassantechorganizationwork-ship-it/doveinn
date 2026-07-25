"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LayoutDashboard, CalendarCheck, BedDouble, Sparkles, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/dashboard/rooms", label: "Rooms", icon: BedDouble },
  { href: "/dashboard/amenities", label: "Amenities", icon: Sparkles },
];

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md border-l-4 border-transparent px-3 py-2.5 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-gold",
              isActive && "border-gold text-gold"
            )}
          >
            <link.icon className="size-5 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarLogo() {
  return (
    <div className="px-6 py-6">
      <p className="font-heading text-2xl text-gold">Dove Inn</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-primary-foreground/50">
        Manager Portal
      </p>
    </div>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="flex flex-col gap-2 px-6 py-5">
        <p className="text-xs text-primary-foreground/70">
          Log out of the manager portal?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut && <Spinner />}
            {loggingOut ? "Logging out..." : "Confirm"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loggingOut}
            className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex cursor-pointer items-center gap-3 px-6 py-5 text-sm font-medium text-red-400 transition-colors hover:text-red-300"
    >
      <LogOut className="size-5" />
      Logout
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col bg-primary md:flex">
        <SidebarLogo />
        <SidebarNav pathname={pathname} />
        <LogoutButton />
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="flex items-center justify-between bg-primary px-4 py-4 md:hidden">
        <div>
          <p className="font-heading text-xl text-gold">Dove Inn</p>
          <p className="text-[10px] uppercase tracking-wide text-primary-foreground/50">
            Manager Portal
          </p>
        </div>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className="text-primary-foreground"
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col bg-primary p-0">
            <SheetHeader className="px-6 py-6">
              <SheetTitle className="font-heading text-xl text-gold">
                Dove Inn
              </SheetTitle>
            </SheetHeader>
            <SidebarNav pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <LogoutButton />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
