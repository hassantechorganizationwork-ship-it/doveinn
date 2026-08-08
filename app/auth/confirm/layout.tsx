import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm Your Account",
  robots: { index: false, follow: false },
};

export default function ConfirmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
