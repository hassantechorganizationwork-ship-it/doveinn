import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Sign up, log in, and manage your Dove Inn Hotel bookings.",
  // Personal to a logged-in guest — nothing here is content worth
  // surfacing in search results.
  robots: { index: false, follow: true },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
