"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/context/ToastContext";

type Review = {
  id: string;
  guest_name: string;
  guest_email: string;
  rating: number;
  review_text: string;
  stay_date: string;
  photo_url: string | null;
  manager_reply: string | null;
  created_at: string;
  rooms: { name: string } | null;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "size-4 fill-gold text-gold"
              : "size-4 text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}

export default function PortalReviewsPage() {
  const toast = useToast();

  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftReply, setDraftReply] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews?admin=true");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load reviews");
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

  const startReply = (review: Review) => {
    setEditingId(review.id);
    setDraftReply(review.manager_reply ?? "");
  };

  const saveReply = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manager_reply: draftReply }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to save reply.");
      }
      setReviews((prev) => prev?.map((r) => (r.id === id ? json.data : r)) ?? prev);
      setEditingId(null);
      toast.success("Reply saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-heading text-3xl text-primary">Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Read guest reviews and reply — your reply appears publicly under the review, credited to the Dove Inn team.
      </p>

      {loading && (
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchReviews}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && reviews?.length === 0 && (
        <div className="mt-6 rounded-xl bg-white py-16 text-center shadow-sm">
          <p className="text-muted-foreground">No reviews yet.</p>
        </div>
      )}

      {!loading && !error && reviews && reviews.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {reviews.map((review) => {
            const isEditing = editingId === review.id;
            return (
              <div key={review.id} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-heading text-lg text-primary">
                      {review.guest_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.guest_email} · {review.rooms?.name ?? "—"} · Stayed{" "}
                      {new Date(review.stay_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Stars rating={review.rating} />
                </div>

                <p className="mt-3 text-sm text-primary">{review.review_text}</p>

                {review.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.photo_url}
                    alt="Guest photo"
                    className="mt-3 h-32 w-32 rounded-lg object-cover"
                  />
                )}

                <div className="mt-4 border-t border-border pt-4">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <Textarea
                        value={draftReply}
                        onChange={(e) => setDraftReply(e.target.value)}
                        placeholder="Write a reply as the Dove Inn team..."
                        className="min-h-20"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={saving}
                          onClick={() => saveReply(review.id)}
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          {saving ? <Spinner /> : <Check className="size-4" />}
                          {saving ? "Saving..." : "Save Reply"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() => setEditingId(null)}
                        >
                          <X className="size-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : review.manager_reply ? (
                    <div className="rounded-lg bg-gold/10 p-3">
                      <p className="text-xs font-semibold text-gold-text">
                        Reply from Dove Inn Team
                      </p>
                      <p className="mt-1 text-sm text-primary">{review.manager_reply}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => startReply(review)}
                      >
                        <Pencil className="size-3.5" />
                        Edit Reply
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => startReply(review)}
                    >
                      <Pencil className="size-3.5" />
                      Reply
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
