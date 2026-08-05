"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDropzone } from "@/components/upload/FileDropzone";
import type { Room } from "@/components/rooms/RoomCard";
import { useToast } from "@/context/ToastContext";
import { uploadWithProgress } from "@/lib/uploadWithProgress";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const RATINGS = [
  { value: "5", label: "5 - Excellent" },
  { value: "4", label: "4 - Very Good" },
  { value: "3", label: "3 - Average" },
  { value: "2", label: "2 - Poor" },
  { value: "1", label: "1 - Terrible" },
];

type FormState = {
  guest_name: string;
  guest_email: string;
  room_id: string;
  stay_date: string;
  rating: string;
  review_text: string;
};

type FieldErrors = Partial<Record<keyof FormState | "photo", string>>;

const today = new Date().toISOString().split("T")[0];

export function ReviewForm({ rooms }: { rooms: Room[] }) {
  const toast = useToast();

  const [formData, setFormData] = useState<FormState>({
    guest_name: "",
    guest_email: "",
    room_id: "",
    stay_date: "",
    rating: "",
    review_text: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wasRepeat, setWasRepeat] = useState(false);
  const [duplicatePrompt, setDuplicatePrompt] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const update = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhotoChange = (file: File | null) => {
    setErrors((prev) => ({ ...prev, photo: undefined }));
    setPhoto(file);
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!formData.guest_name.trim()) {
      newErrors.guest_name = "Full name is required";
    }

    if (!formData.guest_email.trim()) {
      newErrors.guest_email = "Email address is required";
    } else if (!EMAIL_PATTERN.test(formData.guest_email)) {
      newErrors.guest_email = "Enter a valid email address";
    }

    if (!formData.room_id) {
      newErrors.room_id = "Please select a room";
    }

    if (!formData.stay_date) {
      newErrors.stay_date = "Stay date is required";
    } else if (new Date(formData.stay_date).getTime() > Date.now()) {
      newErrors.stay_date = "Stay date can't be in the future";
    }

    if (!formData.rating) {
      newErrors.rating = "Select a rating from 1 to 5";
    }

    if (!formData.review_text.trim()) {
      newErrors.review_text = "Review text is required";
    } else if (formData.review_text.trim().length < 10) {
      newErrors.review_text = "Review must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      guest_name: "",
      guest_email: "",
      room_id: "",
      stay_date: "",
      rating: "",
      review_text: "",
    });
    setPhoto(null);
    setUploadProgress(null);
  };

  const submitReview = async (body: FormData) => {
    setSubmitting(true);
    if (body.has("photo")) setUploadProgress(0);
    try {
      const { status, json } = (await uploadWithProgress(
        "/api/reviews",
        body,
        (pct) => setUploadProgress(pct)
      )) as { status: number; json: Record<string, unknown> };

      if (status === 409 && json.duplicate) {
        // Same email has an existing review — ask before creating another,
        // rather than silently allowing unlimited duplicates.
        setPendingFormData(body);
        setDuplicatePrompt(json.error as string);
        return;
      }

      if (status < 200 || status >= 300 || !json.success) {
        if (json.fieldErrors) {
          setErrors(json.fieldErrors as FieldErrors);
        }
        toast.error((json.error as string) ?? "Something went wrong. Please try again.");
        return;
      }

      const data = json.data as { photo_url?: string | null } | undefined;
      setUploadedPhotoUrl(data?.photo_url ?? null);
      setWasRepeat(Boolean(json.isRepeat));
      setSubmitted(true);
      setDuplicatePrompt(null);
      setPendingFormData(null);
      resetForm();
      toast.success(
        json.isRepeat
          ? "Review submitted — thanks again!"
          : "Review submitted — thank you!"
      );
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicatePrompt(null);
    if (!validate()) return;

    const body = new FormData();
    body.set("guest_name", formData.guest_name);
    body.set("guest_email", formData.guest_email);
    body.set("room_id", formData.room_id);
    body.set("stay_date", formData.stay_date);
    body.set("rating", formData.rating);
    body.set("review_text", formData.review_text);
    if (photo) body.set("photo", photo);

    await submitReview(body);
  };

  const confirmDuplicateSubmit = async () => {
    if (!pendingFormData) return;
    pendingFormData.set("force", "true");
    await submitReview(pendingFormData);
  };

  const cancelDuplicateSubmit = () => {
    setDuplicatePrompt(null);
    setPendingFormData(null);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
        <p className="text-lg font-medium text-primary">
          {wasRepeat
            ? "✅ Thanks again! You've now submitted multiple reviews."
            : "✅ Thank you! Your review has been submitted."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          We appreciate you taking the time to share your experience.
        </p>
        {uploadedPhotoUrl && (
          <div className="relative mx-auto mt-4 h-40 w-full max-w-xs overflow-hidden rounded-lg">
            <Image
              src={uploadedPhotoUrl}
              alt="Your uploaded photo"
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>
        )}
        <Button
          className="mt-6 bg-gold text-gold-foreground hover:bg-gold/90"
          onClick={() => {
            setSubmitted(false);
            setUploadedPhotoUrl(null);
          }}
        >
          Write Another Review
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      {duplicatePrompt && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">{duplicatePrompt}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={submitting}
              onClick={confirmDuplicateSubmit}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {submitting && <Spinner />}
              {submitting ? "Submitting..." : "Yes, submit anyway"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={submitting}
              onClick={cancelDuplicateSubmit}
            >
              No, cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="guest_name">Full Name</Label>
          <Input
            id="guest_name"
            value={formData.guest_name}
            onChange={(e) => update("guest_name", e.target.value)}
            placeholder="e.g. Ahmed Khan"
          />
          {errors.guest_name && (
            <p className="text-xs text-destructive">{errors.guest_name}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="guest_email">Email</Label>
          <Input
            id="guest_email"
            type="email"
            value={formData.guest_email}
            onChange={(e) => update("guest_email", e.target.value)}
            placeholder="e.g. ahmed@example.com"
          />
          {errors.guest_email && (
            <p className="text-xs text-destructive">{errors.guest_email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="room_id">Room Stayed In</Label>
          <Select
            value={formData.room_id}
            onValueChange={(value) => update("room_id", value ?? "")}
          >
            <SelectTrigger id="room_id" className="w-full">
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={String(room.id)}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.room_id && (
            <p className="text-xs text-destructive">{errors.room_id}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stay_date">Stay Date</Label>
          <Input
            id="stay_date"
            type="date"
            max={today}
            value={formData.stay_date}
            onChange={(e) => update("stay_date", e.target.value)}
            className="cursor-pointer"
          />
          {errors.stay_date && (
            <p className="text-xs text-destructive">{errors.stay_date}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rating">Rating</Label>
          <Select
            value={formData.rating}
            onValueChange={(value) => update("rating", value ?? "")}
          >
            <SelectTrigger id="rating" className="w-full">
              <SelectValue placeholder="Rate your stay" />
            </SelectTrigger>
            <SelectContent>
              {RATINGS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rating && (
            <p className="text-xs text-destructive">{errors.rating}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="review_text">Your Review</Label>
          <Textarea
            id="review_text"
            value={formData.review_text}
            onChange={(e) => update("review_text", e.target.value)}
            placeholder="Tell us about your stay (at least 10 characters)"
            className="min-h-28"
          />
          {errors.review_text && (
            <p className="text-xs text-destructive">{errors.review_text}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="photo">Photo (optional)</Label>
          <FileDropzone
            value={photo}
            onChange={handlePhotoChange}
            accept={ALLOWED_PHOTO_TYPES}
            maxSizeBytes={MAX_PHOTO_BYTES}
            error={errors.photo}
            onError={(message) =>
              setErrors((prev) => ({ ...prev, photo: message }))
            }
            progress={submitting ? uploadProgress : null}
            disabled={submitting}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="mt-8 w-full bg-gold text-gold-foreground hover:bg-gold/90"
      >
        {submitting && <Spinner />}
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
