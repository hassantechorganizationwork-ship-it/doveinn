# Case Study: Dove Inn Hotel

## The Problem

Small, independently-run hotels (like a 12-room boutique property in Sharaqpur
Sharif) are almost always booked through phone calls and WhatsApp. There's no
searchable room catalog, no way for a guest to see real-time availability, and
the owner tracks bookings, payments, and check-ins by memory or a notebook.
That doesn't scale past a handful of rooms, and it puts the entire business on
one person's phone.

Dove Inn Hotel solves this with two connected surfaces on one codebase and one
database: a public booking site guests can use without calling anyone, and a
manager portal that replaces the notebook — bookings, room pricing, amenities,
and analytics in one place, updated in real time.

## Tech Choices, and Why

- **Next.js (App Router) for both frontend and backend.** Server Components
  render the room catalog and marketing pages fast and SEO-friendly, while API
  routes under `app/api/**` handle every write (bookings, amenities, room
  price updates). One deploy, one framework, no separate backend service to
  provision or keep in sync.
- **Supabase (Postgres + Auth) over a hand-rolled backend.** Row Level
  Security policies enforce who can read/write each table directly at the
  database layer — guests can create a booking but not read others', managers
  can update rooms but the public can't. That's a real permissions boundary,
  not just a check in application code that a bug could bypass.
- **Two separate auth flows, one Supabase project.** Managers are tagged via
  `app_metadata.role`, which only the service role can set — a guest signing
  themselves up can never grant themselves manager access, no matter what
  they put in their own profile.
- **Vercel for hosting.** Zero-config deploys directly from GitHub, preview
  deployments per PR, and Next.js's own team behind the platform — the least
  friction between "push to `main`" and "live."
- **Vitest + Testing Library + Playwright.** Vitest for fast, isolated unit
  tests against API routes and components (mocking Supabase at the module
  boundary); Playwright for one true end-to-end flow through a real browser,
  because some bugs (layout overflow, a button rendered but unclickable) only
  show up when something actually renders.

## A Challenge I Hit, and How I Solved It

Guest signup needed email confirmation to be real — not just a checkbox that
always passes — so a fake email couldn't be used to create an account. The
obvious approach was Supabase's built-in mailer, but in practice it's
aggressively rate-limited and unreliable for anything beyond local testing:
confirmation emails would silently fail to arrive, with no error surfaced to
the user or in the logs.

I diagnosed this by testing the exact failure mode: signing up with a real
inbox and confirming nothing arrived, even after the rate-limit window passed.
That ruled out "just a timing issue." The fix was decoupling email delivery
from Supabase's default path entirely — wiring in a dedicated transactional
email provider (Resend, over a verified domain) as custom SMTP, then adding a
server route (`/auth/confirm`) that exchanges the provider's confirmation code
for a real Supabase session via the PKCE flow. Without that exchange step, a
guest's email would show as "confirmed" in the database but they'd still be
logged out — confirming an account and being signed in are two different
operations, and skipping the second one silently breaks the flow in a way
that's easy to miss in testing if you only check the database, not the
browser session.

The broader lesson: for anything auth-related, "the database looks right" and
"the user is actually logged in" have to be verified separately — they can
disagree.
