import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Currency Converter",
  description:
    "Check live exchange rates against the Pakistani Rupee and convert Dove Inn Hotel room prices into your home currency.",
};

export default function CurrencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
