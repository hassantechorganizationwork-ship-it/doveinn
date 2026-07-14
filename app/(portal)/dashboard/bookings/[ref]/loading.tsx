import { Skeleton } from "@/components/ui/skeleton";

export default function BookingDetailLoading() {
  return (
    <div className="p-6 md:p-10">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-8 w-48" />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-4 h-9 w-28" />
      </div>
    </div>
  );
}
