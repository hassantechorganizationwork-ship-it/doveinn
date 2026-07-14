import { Skeleton } from "@/components/ui/skeleton";

export default function RoomDetailLoading() {
  return (
    <div>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <Skeleton className="h-4 w-48" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          {/* LEFT COLUMN */}
          <div>
            {/* IMAGE SECTION */}
            <Skeleton className="h-72 w-full rounded-xl md:h-[420px]" />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg md:h-28" />
              ))}
            </div>

            {/* ROOM INFO */}
            <div className="mt-8">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-4 h-4 w-32" />
            </div>

            {/* AMENITIES */}
            <div className="mt-10">
              <Skeleton className="h-7 w-40" />
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-28" />
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-8 w-32" />
            <div className="mt-6 flex flex-col gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="mt-6 h-10 w-full" />
            <Skeleton className="mt-3 h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
