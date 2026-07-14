import Link from "next/link";
import { CalendarCheck, Clock, BedDouble, TrendingUp } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingWithRoom } from "@/lib/supabase/bookings";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [
    { count: pendingApprovals },
    { count: todayBookings },
    { data: occupiedRows },
    { data: revenueRows },
    { data: recent },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("booking_status", "pending"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStr)
      .lt("created_at", tomorrowStr),
    supabase
      .from("bookings")
      .select("id")
      .eq("booking_status", "confirmed")
      .lte("check_in", todayStr)
      .gt("check_out", todayStr),
    supabase
      .from("bookings")
      .select("advance_amount")
      .eq("booking_status", "confirmed")
      .gte("created_at", monthStart),
    supabase
      .from("bookings")
      .select("*, rooms(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const occupiedRooms = occupiedRows?.length ?? 0;
  const monthlyRevenue = (revenueRows ?? []).reduce(
    (sum, row) => sum + (row.advance_amount ?? 0),
    0
  );
  const recentBookings = (recent ?? []) as BookingWithRoom[];

  const STAT_CARDS = [
    {
      label: "Today's Bookings",
      value: todayBookings ?? 0,
      icon: CalendarCheck,
      accent: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals ?? 0,
      icon: Clock,
      accent: "bg-orange-100 text-orange-600",
    },
    {
      label: "Rooms Occupied",
      value: `${occupiedRooms}/12`,
      icon: BedDouble,
      accent: "bg-green-100 text-green-600",
    },
    {
      label: "Monthly Revenue",
      value: `Rs ${monthlyRevenue.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      accent: "bg-gold/10 text-gold",
    },
  ];

  return (
    <div className="p-6 md:p-10">
      {/* PAGE HEADER */}
      <div>
        <h1 className="font-heading text-3xl text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm">
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${card.accent}`}
            >
              <card.icon className="size-5" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-primary">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* RECENT BOOKINGS */}
      <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl text-primary">
            Recent Bookings
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium text-gold hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Ref#</th>
                <th className="py-2 pr-4 font-medium">Guest</th>
                <th className="py-2 pr-4 font-medium">Room</th>
                <th className="py-2 pr-4 font-medium">Check-in</th>
                <th className="py-2 pr-4 font-medium">Check-out</th>
                <th className="py-2 pr-4 font-medium">Nights</th>
                <th className="py-2 pr-4 font-medium">Total</th>
                <th className="py-2 pr-4 font-medium">Advance</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => {
                  const nights = differenceInCalendarDays(
                    new Date(booking.check_out),
                    new Date(booking.check_in)
                  );
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-border last:border-none"
                    >
                      <td className="py-3 pr-4 font-medium text-primary">
                        {booking.booking_ref}
                      </td>
                      <td className="py-3 pr-4 text-primary">
                        {booking.guest_name}
                      </td>
                      <td className="py-3 pr-4 text-primary">
                        {booking.rooms?.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {booking.check_in}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {booking.check_out}
                      </td>
                      <td className="py-3 pr-4 text-primary">{nights}</td>
                      <td className="py-3 pr-4 text-primary">
                        Rs {booking.total_amount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-primary">
                        Rs {booking.advance_amount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={booking.booking_status} />
                      </td>
                      <td className="py-3 pr-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          render={
                            <Link
                              href={`/dashboard/bookings/${booking.booking_ref}`}
                            />
                          }
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
