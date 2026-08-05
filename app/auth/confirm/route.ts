import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase's confirmation email links here with a one-time `code`. We
// exchange it for a real session (setting the auth cookies) before sending
// the guest on to their account — this is the PKCE handshake the
// @supabase/ssr client expects; skipping it leaves them "confirmed" but
// logged out.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/account/login?error=confirmation_failed`
  );
}
