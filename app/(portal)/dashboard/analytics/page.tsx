"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CalendarCheck, TrendingUp, Receipt, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookingStatus } from "@/lib/supabase/bookings";

type AnalyticsBooking = {
  id: string;
  created_at: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  advance_amount: number;
  booking_status: BookingStatus;
  room_id: string;
  rooms: { name: string; type: "master" | "twin" } | null;
};

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
];

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  checked_in: "Checked In",
  checked_out: "Checked Out",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "#facc15",
  confirmed: "#16a34a",
  rejected: "#dc2626",
  cancelled: "#9ca3af",
  checked_in: "#2563eb",
  checked_out: "#4b5563",
};

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<AnalyticsBooking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("30");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/analytics");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load analytics.");
      }
      setBookings(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const filtered = useMemo(() => {
    if (!bookings) return [];
    if (range === "all") return bookings;
    const days = Number(range);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return bookings.filter((b) => new Date(b.created_at).getTime() >= cutoff);
  }, [bookings, range]);

  const stats = useMemo(() => {
    const totalBookings = filtered.length;
    const totalRevenue = filtered.reduce((sum, b) => sum + b.advance_amount, 0);
    const avgValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const confirmedCount = filtered.filter(
      (b) => b.booking_status === "confirmed" || b.booking_status === "checked_in" || b.booking_status === "checked_out"
    ).length;
    const confirmedRate = totalBookings > 0 ? (confirmedCount / totalBookings) * 100 : 0;

    return { totalBookings, totalRevenue, avgValue, confirmedRate };
  }, [filtered]);

  // Bucket by day for short ranges, by month for longer ones — keeps the
  // line chart readable instead of one point per day over months of data.
  const trendData = useMemo(() => {
    const useMonthBuckets = range === "90" || range === "all";
    const buckets = new Map<string, { bookings: number; revenue: number }>();

    for (const b of filtered) {
      const date = new Date(b.created_at);
      const key = useMonthBuckets
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : date.toISOString().split("T")[0];
      const bucket = buckets.get(key) ?? { bookings: 0, revenue: 0 };
      bucket.bookings += 1;
      bucket.revenue += b.advance_amount;
      buckets.set(key, bucket);
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        label: useMonthBuckets
          ? new Date(`${key}-01`).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
          : new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ...value,
      }));
  }, [filtered, range]);

  const roomData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of filtered) {
      const name = b.rooms?.name ?? "Unknown";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, bookings]) => ({ name, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);
  }, [filtered]);

  const statusData = useMemo(() => {
    const counts = new Map<BookingStatus, number>();
    for (const b of filtered) {
      counts.set(b.booking_status, (counts.get(b.booking_status) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([status, value]) => ({
      name: STATUS_LABELS[status],
      value,
      color: STATUS_COLORS[status],
    }));
  }, [filtered]);

  const STAT_CARDS = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarCheck,
      accent: "bg-blue-100 text-blue-600",
    },
    {
      label: "Advance Revenue",
      value: `Rs ${Math.round(stats.totalRevenue).toLocaleString()}`,
      icon: TrendingUp,
      accent: "bg-gold/10 text-gold",
    },
    {
      label: "Avg Booking Value",
      value: `Rs ${Math.round(stats.avgValue).toLocaleString()}`,
      icon: Receipt,
      accent: "bg-orange-100 text-orange-600",
    },
    {
      label: "Confirmed Rate",
      value: `${Math.round(stats.confirmedRate)}%`,
      icon: BadgeCheck,
      accent: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl text-primary">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Booking trends, revenue, and room performance.
          </p>
        </div>
        <Select value={range} onValueChange={(v) => v && setRange(v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Retry
          </Button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filtered.length === 0 && (
        <div className="mt-8 rounded-xl bg-white py-16 text-center shadow-sm">
          <p className="text-muted-foreground">
            No bookings in this time range yet.
          </p>
        </div>
      )}

      {/* CHARTS */}
      {!loading && !error && filtered.length > 0 && (
        <div className="mt-8 space-y-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
              </div>
            ))}
          </div>

          {/* LINE CHART: BOOKINGS & REVENUE TREND */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg text-primary">
              Bookings & Revenue Trend
            </h2>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#1C1C1C"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Advance Revenue (Rs)"
                    stroke="#C9A84C"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* BAR CHART: BOOKINGS BY ROOM */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg text-primary">
                Bookings by Room
              </h2>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roomData} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      width={110}
                    />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#C9A84C" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PIE CHART: BOOKING STATUS BREAKDOWN */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg text-primary">
                Booking Status Breakdown
              </h2>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
