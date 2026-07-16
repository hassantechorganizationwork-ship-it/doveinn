import { RoomCardSkeleton } from "@/components/rooms/RoomCardSkeleton";

export default function RoomsLoading() {
  return (
    <div>
      <section className="-mt-20 bg-primary pt-32 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl md:text-5xl">
            Our Rooms
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
