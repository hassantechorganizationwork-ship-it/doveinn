import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/supabase/bookings";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-yellow-400 text-yellow-950",
  confirmed: "bg-green-600 text-white",
  rejected: "bg-red-600 text-white",
  cancelled: "bg-gray-400 text-white",
  checked_in: "bg-blue-600 text-white",
  checked_out: "bg-gray-600 text-white",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  checked_in: "Checked In",
  checked_out: "Checked Out",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge className={cn("border-none capitalize", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
