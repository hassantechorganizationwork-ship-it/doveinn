import { Skeleton } from "@/components/ui/skeleton";

export function BookingRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-none">
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-8 w-16" />
      </td>
    </tr>
  );
}
