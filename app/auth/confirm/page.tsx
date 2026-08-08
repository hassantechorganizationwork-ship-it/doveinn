"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

// This is a page the guest has to actively click through, not an
// auto-redirecting route handler — email providers and antivirus software
// routinely "prefetch" links in an email to scan them for safety, and since
// Supabase's confirmation code is one-time-use, an auto-exchange on page
// load gets silently consumed by that scan before the guest ever clicks it.
// Requiring a real click here means only a genuine visit consumes the code.
function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleConfirm = async () => {
    if (!code) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      setStatus("error");
      return;
    }
    const separator = next.includes("?") ? "&" : "?";
    router.push(`${next}${separator}confirmed=1`);
  };

  if (!code || status === "error") {
    router.replace("/account/login?error=confirmation_failed");
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-gold/10">
        <CheckCircle2 className="size-7 text-gold-text" />
      </div>
      <h1 className="mt-4 font-heading text-2xl text-primary">
        Confirm Your Email
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Click below to finish setting up your Dove Inn Hotel account.
      </p>
      <Button
        size="lg"
        disabled={status === "loading"}
        onClick={handleConfirm}
        className="mt-6 w-full bg-gold text-gold-foreground hover:bg-gold/90"
      >
        {status === "loading" && <Spinner />}
        {status === "loading" ? "Confirming..." : "Confirm My Account"}
      </Button>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmContent />
    </Suspense>
  );
}
