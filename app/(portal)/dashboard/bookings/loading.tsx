import { Skeleton } from "@/components/ui/skeleton";
import { BookingRowSkeleton } from "@/components/portal/BookingRowSkeleton";

export default function BookingsLoading() {
  return (
    <div className="p-6 md:p-10">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* FILTER TABS */}
      <div className="mt-6 flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      {/* TABLE */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
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
                <th className="py-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <BookingRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
