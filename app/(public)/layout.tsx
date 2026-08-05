import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://doveinn.pk"),
  title: {
    default: "Dove Inn Hotel | Comfortable Stay in Lahore",
    template: "%s | Dove Inn Hotel",
  },
  description:
    "Dove Inn Hotel offers 12 elegantly appointed rooms in Lahore. Book Master Bedrooms and Twin Rooms at best rates. 24/7 reception, free WiFi, and warm Pakistani hospitality.",
  keywords: [
    "hotel in Lahore",
    "Dove Inn Hotel",
    "budget hotel Lahore",
    "hotel booking Pakistan",
    "master bedroom hotel",
    "twin room hotel Lahore",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://doveinn.pk",
    siteName: "Dove Inn Hotel",
    title: "Dove Inn Hotel | Comfortable Stay in Lahore",
    description:
      "Book your stay at Dove Inn Hotel. 12 rooms, best rates, warm hospitality in Lahore.",
    images: [
      {
        url: "/images/rooms/exterior-1.png",
        width: 1200,
        height: 630,
        alt: "Dove Inn Hotel Lahore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dove Inn Hotel | Comfortable Stay in Lahore",
    description:
      "Book your stay at Dove Inn Hotel. 12 rooms, best rates, warm hospitality in Lahore.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: "Dove Inn Hotel",
  url: "https://doveinn.pk",
  telephone: "+923240041300",
  email: "hassanshafiq03240041300@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Taiba Colony, Hazrat Ali Street, Dove Inn Hotel",
    addressLocality: "Sharaqpur Sharif",
    addressCountry: "PK",
  },
  numberOfRooms: 12,
  priceRange: "Rs 5,000 - Rs 9,000",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Air Conditioning", value: true },
    { "@type": "LocationFeatureSpecification", name: "24/7 Reception", value: true },
    { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
  ],
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
