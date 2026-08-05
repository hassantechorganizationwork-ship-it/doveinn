"use client";

import { useRef, useState } from "react";
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
import type { Room } from "@/components/rooms/RoomCard";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormState>({
    guest_name: "",
    guest_email: "",
    room_id: "",
    stay_date: "",
    rating: "",
    review_text: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setErrors((prev) => ({ ...prev, photo: undefined }));

    if (!file) {
      setPhoto(null);
      return;
    }

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: "Photo must be a JPEG, PNG, WEBP, or GIF image" }));
      setPhoto(null);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((prev) => ({ ...prev, photo: "Photo must be smaller than 5MB" }));
      setPhoto(null);
      e.target.value = "";
      return;
    }

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const body = new FormData();
      body.set("guest_name", formData.guest_name);
      body.set("guest_email", formData.guest_email);
      body.set("room_id", formData.room_id);
      body.set("stay_date", formData.stay_date);
      body.set("rating", formData.rating);
      body.set("review_text", formData.review_text);
      if (photo) body.set("photo", photo);

      const res = await fetch("/api/reviews", { method: "POST", body });
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.fieldErrors) {
          setErrors(json.fieldErrors);
        }
        setBanner({
          type: "error",
          text: json.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setBanner({
        type: "success",
        text: "Thank you! Your review has been submitted.",
      });
      resetForm();
    } catch {
      setBanner({
        type: "error",
        text: "Couldn't reach the server. Check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      {banner && (
        <div
          className={
            "mb-6 rounded-lg px-4 py-3 text-sm font-medium " +
            (banner.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-destructive/10 text-destructive")
          }
        >
          {banner.text}
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
          <Input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            className="cursor-pointer"
          />
          {errors.photo && (
            <p className="text-xs text-destructive">{errors.photo}</p>
          )}
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
