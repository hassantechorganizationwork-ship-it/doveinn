"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RoomInquiryForm({ roomName }: { roomName: string }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `Hi, I'm interested in the ${roomName}. Could you share more details about availability and pricing for my dates?`
  );
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const newErrors: typeof errors = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) newErrors.email = "Email address is required";
    else if (!EMAIL_PATTERN.test(email)) newErrors.email = "Enter a valid email address";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          subject: `Inquiry about ${roomName}`,
          message,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to send your message.");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="font-medium text-primary">
          ✅ Message sent! We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="flex items-center gap-2 font-heading text-xl text-primary">
        <Mail className="size-5 text-gold-text" />
        Send a Mail About This Room
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Have a question before booking? Send us a quick message — we&apos;ve
        pre-filled it for you, just add your details.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inquiry-name">Full Name</Label>
            <Input
              id="inquiry-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ahmed Khan"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inquiry-email">Email</Label>
            <Input
              id="inquiry-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ahmed@example.com"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inquiry-message">Message</Label>
          <Textarea
            id="inquiry-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24"
          />
        </div>

        {submitError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {submitting && <Spinner />}
          {submitting ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
