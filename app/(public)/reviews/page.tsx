import type { Metadata } from "next";
import Link from "next/link";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { RecentReviews } from "@/components/reviews/RecentReviews";
import { getRooms } from "@/lib/supabase/rooms";

export const metadata: Metadata = {
  title: "Share Your Experience",
  description:
    "Tell us about your stay at Dove Inn Hotel — rate your room, share a photo, and help other travelers.",
};

export default async function ReviewsPage() {
  const rooms = await getRooms();

  return (
    <div>
      {/* PAGE HEADER */}
      <section className="-mt-20 bg-primary pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl md:text-5xl">
            Share Your Experience
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold">Reviews</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        <p className="text-center text-muted-foreground">
          Stayed with us recently? We&apos;d love to hear about it.
        </p>

        <div className="mt-8">
          <ReviewForm rooms={rooms} />
        </div>

        <RecentReviews />
      </section>
    </div>
  );
}
