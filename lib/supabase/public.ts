import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-less client for public, unauthenticated reads (rooms listing, room
 * detail, home page). Safe to use in generateStaticParams, where the
 * cookie-based server client (lib/supabase/server.ts) isn't available.
 */
export const createClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
