"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Star, MessageSquareOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ReviewRow = {
  id: string;
  guest_name: string;
  rating: number;
  review_text: string;
  stay_date: string;
  photo_url: string | null;
  created_at: string;
  rooms: { name: string } | null;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            "size-4 " +
            (i < rating ? "fill-gold text-gold" : "fill-none text-muted-foreground")
          }
        />
      ))}
    </div>
  );
}

export function RecentReviews() {
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load reviews.");
      }
      setReviews(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <section className="mt-16">
      <h2 className="text-center font-heading text-2xl text-primary">
        What Our Guests Say
      </h2>

      {/* LOADING STATE */}
      {loading && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="flex flex-col gap-3 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReviews}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Retry
          </Button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && reviews?.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-12 text-center">
          <MessageSquareOff className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No reviews yet — be the first to share your experience!
          </p>
        </div>
      )}

      {/* SUCCESS STATE */}
      {!loading && !error && reviews && reviews.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review.id} className="border-none shadow-sm">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-primary">{review.guest_name}</p>
                  <StarRow rating={review.rating} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Stayed in {review.rooms?.name ?? "a room"} · {review.stay_date}
                </p>
                <p className="text-sm text-muted-foreground">{review.review_text}</p>
                {review.photo_url && (
                  <div className="relative mt-1 h-40 w-full overflow-hidden rounded-lg">
                    <Image
                      src={review.photo_url}
                      alt={`Photo shared by ${review.guest_name}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
