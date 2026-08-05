import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type FieldErrors = Record<string, string>;

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid form submission" },
      { status: 400 }
    );
  }

  const guestName = String(form.get("guest_name") ?? "").trim();
  const guestEmail = String(form.get("guest_email") ?? "").trim();
  const roomId = String(form.get("room_id") ?? "").trim();
  const stayDate = String(form.get("stay_date") ?? "").trim();
  const ratingRaw = String(form.get("rating") ?? "").trim();
  const reviewText = String(form.get("review_text") ?? "").trim();
  const photo = form.get("photo");
  const force = String(form.get("force") ?? "") === "true";

  const supabase = createAdminClient();
  const fieldErrors: FieldErrors = {};

  // --- Field-by-field server-side validation. The client validates the
  // same rules, but none of this is trusted from the request alone. ---

  if (!guestName) {
    fieldErrors.guest_name = "Full name is required";
  }

  if (!guestEmail) {
    fieldErrors.guest_email = "Email address is required";
  } else if (!EMAIL_PATTERN.test(guestEmail)) {
    fieldErrors.guest_email = "Enter a valid email address";
  }

  if (!roomId) {
    fieldErrors.room_id = "Please select a room";
  } else {
    const { data: room } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", roomId)
      .maybeSingle();
    if (!room) {
      fieldErrors.room_id = "Selected room does not exist";
    }
  }

  if (!stayDate) {
    fieldErrors.stay_date = "Stay date is required";
  } else {
    const parsed = new Date(stayDate);
    if (Number.isNaN(parsed.getTime())) {
      fieldErrors.stay_date = "Enter a valid date";
    } else if (parsed.getTime() > Date.now()) {
      fieldErrors.stay_date = "Stay date can't be in the future";
    }
  }

  const rating = Number(ratingRaw);
  if (!ratingRaw || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    fieldErrors.rating = "Select a rating from 1 to 5";
  }

  if (!reviewText) {
    fieldErrors.review_text = "Review text is required";
  } else if (reviewText.length < 10) {
    fieldErrors.review_text = "Review must be at least 10 characters";
  }

  let photoFile: File | null = null;
  if (photo instanceof File && photo.size > 0) {
    if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
      fieldErrors.photo = "Photo must be a JPEG, PNG, WEBP, or GIF image";
    } else if (photo.size > MAX_PHOTO_BYTES) {
      fieldErrors.photo = "Photo must be smaller than 5MB";
    } else {
      photoFile = photo;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { success: false, error: "Please fix the errors below.", fieldErrors },
      { status: 400 }
    );
  }

  // --- Ask for confirmation before letting the same email submit more than
  // one review, instead of silently allowing unlimited duplicates. ---

  const { count: existingCount } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("guest_email", guestEmail);

  const isRepeat = (existingCount ?? 0) > 0;

  if (isRepeat && !force) {
    return NextResponse.json(
      {
        success: false,
        duplicate: true,
        error:
          "You've already submitted a review with this email address. Submit another one anyway?",
      },
      { status: 409 }
    );
  }

  // --- Upload photo (if any), then insert the review. ---

  let photoUrl: string | null = null;
  if (photoFile) {
    const extension = photoFile.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const buffer = Buffer.from(await photoFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("review-photos")
      .upload(path, buffer, { contentType: photoFile.type });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: "Failed to upload photo: " + uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("review-photos")
      .getPublicUrl(path);
    photoUrl = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      guest_name: guestName,
      guest_email: guestEmail,
      room_id: roomId,
      stay_date: stayDate,
      rating,
      review_text: reviewText,
      photo_url: photoUrl,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: error?.message ?? "Failed to submit review" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data, isRepeat }, { status: 201 });
}
