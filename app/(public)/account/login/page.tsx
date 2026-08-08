"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

type FormData = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSignedUp = searchParams.get("confirm") === "1";
  const confirmationFailed = searchParams.get("error") === "confirmation_failed";

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!EMAIL_PATTERN.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setSubmitError("Invalid email or password");
      setSubmitting(false);
      return;
    }

    router.push("/account");
    router.refresh();
  };

  const handleResend = async () => {
    setResendMessage(null);
    if (!formData.email.trim() || !EMAIL_PATTERN.test(formData.email)) {
      setResendMessage("Enter your email address above first, then tap resend.");
      return;
    }

    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: formData.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setResending(false);

    setResendMessage(
      error
        ? error.message
        : "A new confirmation link has been sent — check your email."
    );
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-20">
      <div className="text-center">
        <Image
          src="/images/brand/logo-dark.png"
          alt="Dove Inn Hotel"
          width={220}
          height={147}
          className="mx-auto h-auto w-40"
        />
        <h1 className="mt-4 font-heading text-xl text-primary">
          Log In to Your Account
        </h1>
      </div>

      {justSignedUp && (
        <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-700">
          Account created! Please check your email to confirm your address
          before logging in.
        </p>
      )}

      {confirmationFailed && (
        <div className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          <p>That confirmation link is invalid or has expired.</p>
          <p className="mt-1">
            Enter your email below, then{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-medium underline underline-offset-2 disabled:opacity-60"
            >
              {resending ? "sending..." : "resend the confirmation link"}
            </button>
            .
          </p>
        </div>
      )}

      {resendMessage && (
        <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-center text-sm text-green-700">
          {resendMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="e.g. ahmed@example.com"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        {submitError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {submitting && <Spinner />}
          {submitting ? "Signing in..." : "Log In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/account/signup" className="font-medium text-gold-text hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function GuestLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
