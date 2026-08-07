import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Booking",
  description: "Check the live status of your Dove Inn Hotel booking using your reference number and email.",
  robots: { index: false, follow: true },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
