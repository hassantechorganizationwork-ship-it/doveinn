import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/portal/StatusBadge";
import type { BookingStatus } from "@/lib/supabase/bookings";

describe("StatusBadge", () => {
  const cases: Array<[BookingStatus, string]> = [
    ["pending", "Pending"],
    ["confirmed", "Confirmed"],
    ["rejected", "Rejected"],
    ["cancelled", "Cancelled"],
    ["checked_in", "Checked In"],
    ["checked_out", "Checked Out"],
  ];

  it.each(cases)("renders the correct label for status=%s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
