import { NextRequest, NextResponse } from "next/server";
import { sendContactMessageEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: {
    fullName?: unknown;
    email?: unknown;
    subject?: unknown;
    message?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const fieldErrors: Record<string, string> = {};
  if (!fullName) fieldErrors.fullName = "Full name is required";
  if (!email) fieldErrors.email = "Email address is required";
  else if (!EMAIL_PATTERN.test(email)) fieldErrors.email = "Enter a valid email address";
  if (!subject) fieldErrors.subject = "Subject is required";
  if (!message) fieldErrors.message = "Message is required";

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { success: false, error: "Please fix the errors below.", fieldErrors },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { error: insertError } = await supabase
    .from("contact_messages")
    .insert({ full_name: fullName, email, subject, message });

  if (insertError) {
    return NextResponse.json(
      { success: false, error: "Failed to save your message. Please try again." },
      { status: 500 }
    );
  }

  // The message is already saved and visible in the manager portal even if
  // the notification email fails to send — don't fail the whole request
  // over a delivery hiccup the guest can't do anything about.
  await sendContactMessageEmail({ fullName, email, subject, message });

  return NextResponse.json({ success: true });
}
