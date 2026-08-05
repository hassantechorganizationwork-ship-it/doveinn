import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Booking",
  description: "Enter your details and confirm your stay at Dove Inn Hotel.",
  // Transactional flow tied to a specific room/date selection — not a
  // page that should show up in search results.
  robots: { index: false, follow: true },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
