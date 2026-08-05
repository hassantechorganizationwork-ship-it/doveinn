import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RoomCardSkeleton() {
  return (
    <Card className="overflow-hidden border-none py-0 shadow-sm">
      <Skeleton className="h-48 w-full rounded-none" />

      <CardContent className="flex flex-col gap-4 p-5">
        <div>
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-1/4" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-8 w-full sm:flex-1" />
          <Skeleton className="h-8 w-full sm:flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}
