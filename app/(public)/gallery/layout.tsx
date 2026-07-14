import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "View photos of Dove Inn Hotel rooms, common areas, and exterior. See what awaits you during your stay.",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
