import { Skeleton } from "@/components/ui/skeleton";
import { BookingRowSkeleton } from "@/components/portal/BookingRowSkeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-10">
      {/* PAGE HEADER */}
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      {/* STATS CARDS */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="mt-4 h-7 w-16" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
        ))}
      </div>

      {/* RECENT BOOKINGS */}
      <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-16" />
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
              {Array.from({ length: 5 }).map((_, i) => (
                <BookingRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
