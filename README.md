# Dove Inn Hotel

A full-stack hotel booking website for a 12-room boutique hotel in Lahore, Pakistan. It includes a public-facing marketing/booking site (home, rooms, gallery, about, contact, multi-step booking flow) and a password-protected manager portal for reviewing and confirming bookings — all backed by a real Supabase database.

## Live Demo

**[https://doveinn-five.vercel.app/](https://doveinn-five.vercel.app/)**

---

## Why I Chose This Framework

I built this on **Next.js 16 (App Router)** rather than a plain React SPA or a separate frontend/backend split, for a few reasons specific to a hotel site:

- **File-based routing that mirrors the sitemap.** Nested folders (`app/(public)/rooms/[slug]`) map directly to real URLs like `/rooms/master-suite-7`, and route groups (`(public)`, `(portal)`) let the marketing site and the manager dashboard have completely different layouts (navbar/footer vs. sidebar) without duplicating code.
- **Static generation for the pages that matter for SEO.** The homepage, room listing, and every individual room page are statically generated at build time (`generateStaticParams` pulls all room slugs from Supabase), so search engines and first-time visitors get fast, fully-rendered HTML instead of a blank shell waiting on JavaScript — important for a hotel that depends on organic search and Google Maps traffic.
- **Built-in image optimization.** `next/image` automatically serves resized, lazy-loaded room photos across the gallery, room cards, and detail pages without a separate image CDN or manual `srcset` work.
- **API routes live next to the app.** Booking creation, availability checks, and booking status updates (`app/api/...`) run as serverless functions in the same project — no separate backend service to deploy or CORS-configure.
- **One-command deploys.** Next.js deploys natively to Vercel with zero config, including the dynamic API routes and the middleware-based auth guard on the manager portal.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (on top of [Base UI](https://base-ui.com/)) |
| Icons | [lucide-react](https://lucide.dev/) |
| Backend / Database | [Supabase](https://supabase.com/) (Postgres, Auth, Row Level Security) |
| Auth | Supabase Auth (`@supabase/ssr`) via Next.js middleware |
| Global state | React Context API (`context/AuthContext.tsx`, `context/ToastContext.tsx`) — no external state library; the app's shared state (auth session, toast notifications) is simple enough that Context covers it without the overhead of Redux/Zustand |
| Forms & utilities | `date-fns`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| Deployment | [Vercel](https://vercel.com/) |

## Project Structure

```
doveinn/
├── middleware.ts              # Route guards for both /dashboard (manager, role-checked) and /account (guest)
├── components.json            # shadcn/ui configuration (style, aliases, icon library)
├── context/                    # Global state (React Context, no external library)
│   ├── AuthContext.tsx          #   Shared guest-auth session (Navbar + My Bookings both read from here)
│   └── ToastContext.tsx         #   Global toast notifications, mounted once at the root layout
├── app/
│   ├── layout.tsx             # Root layout — fonts, wraps everything in <ToastProvider>
│   ├── globals.css            # Tailwind v4 theme tokens, CSS variables, base styles
│   ├── (public)/              # Public marketing site — wrapped in Navbar + Footer + <AuthProvider>
│   │   ├── layout.tsx         #   SEO metadata (OpenGraph, Twitter, JSON-LD Hotel schema)
│   │   ├── page.tsx           #   Home page (hero, featured rooms, live amenities, CTA)
│   │   ├── rooms/              #   Room listing (+ loading skeleton)
│   │   │   └── [slug]/         #   Individual room detail page (statically generated)
│   │   ├── gallery/            #   Photo gallery with category filters + lightbox
│   │   ├── currency/            #   Live PKR exchange-rate converter
│   │   ├── reviews/             #   Guest review form + recent-reviews list
│   │   ├── account/             #   Guest signup/login + protected "My Bookings"
│   │   ├── about/               #   Story, values, quick facts
│   │   ├── contact/             #   Contact info, embedded map, contact form
│   │   └── booking/             #   3-step booking flow + confirmation page
│   ├── (portal)/               # Manager portal — no public Navbar/Footer
│   │   ├── login/page.tsx      #   Manager sign-in (Supabase Auth)
│   │   └── dashboard/           #   Sidebar-based layout, auth-protected (role: "manager")
│   │       ├── page.tsx         #     Stats + recent bookings
│   │       ├── bookings/         #     All bookings, filterable, confirm/reject
│   │       ├── bookings/[ref]/   #     Single booking detail + manager notes
│   │       ├── rooms/            #     Room price management
│   │       └── amenities/        #     Amenities CRUD (create/edit/delete)
│   └── api/                    # Serverless API routes
│       ├── bookings/route.ts    #   POST — create a new booking
│       ├── bookings/[ref]/route.ts # PATCH — confirm/reject a booking, blocks dates
│       ├── availability/route.ts  # GET — check if a room is free for given dates
│       ├── amenities/             # GET/POST (list, create) + [id]/route.ts for PATCH/DELETE
│       ├── account/bookings/route.ts # GET — a guest's own bookings, filtered by session email
│       └── reviews/route.ts       # GET (recent, public fields only) / POST (multipart, with photo)
├── components/
│   ├── ui/                    # shadcn/ui primitives (button, card, badge, sheet, select, skeleton, spinner, etc.)
│   ├── layout/                # Navbar, Footer, WhatsAppButton
│   ├── rooms/                 # RoomCard, RoomsGrid, BookingSidebar, loading skeletons
│   ├── booking/                # StepIndicator for the multi-step booking flow
│   ├── contact/                # ContactForm
│   ├── amenities/               # AmenityIcon (keyword/emoji → icon mapping)
│   ├── reviews/                 # ReviewForm (multipart submit, duplicate-email confirm), RecentReviews
│   ├── upload/                  # FileDropzone — drag-and-drop image picker with preview + progress bar
│   └── portal/                 # Sidebar, StatusBadge, BookingsTable, BookingDetail, skeletons
├── lib/
│   ├── supabase/               # client.ts (browser), server.ts (cookie-aware), admin.ts (service role),
│   │                            # public.ts (anon, for static generation), rooms.ts / bookings.ts / amenities.ts (queries + types)
│   ├── data/                   # Original hardcoded room/booking fixtures, kept as fallback reference
│   ├── uploadWithProgress.ts   # XMLHttpRequest-based multipart upload with real progress events
│   └── utils.ts                # `cn()` class-merging helper
├── public/
│   └── images/rooms/            # Real hotel photography (rooms, bathrooms, kitchen, exterior)
└── supabase/
    └── schema.sql              # Full schema: rooms, bookings, room_availability, amenities, reviews + RLS policies
```

## Design System

Defined in `app/globals.css` as CSS custom properties (Tailwind v4's CSS-first config — there is no `tailwind.config.ts`).

**Colors**
| Token | Value | Usage |
|---|---|---|
| `--background` | `#FAFAF8` | Warm off-white page background |
| `--primary` | `#1C1C1C` | Near-black — dark sections, primary buttons, text |
| `--gold` | `#C9A84C` | Accent color — CTAs, prices, active states, badges |
| `--foreground` | `#1C1C1C` | Body text |
| `--muted` / `--border` | `oklch(...)` neutrals | Card backgrounds, dividers, secondary text |

**Typography**
- **Headings** — `Playfair Display` (serif), loaded via `next/font/google`, exposed as the `font-heading` utility class.
- **Body** — `Inter` (sans-serif), the default `font-sans`.

**Shape & Spacing**
- Border radius is driven by a single `--radius: 0.625rem` variable, scaled into `--radius-sm` through `--radius-4xl` so every card, button, and badge shares one consistent corner language.
- Interactive elements (`components/ui/button.tsx`) share a common set of states: a gold `box-shadow` glow on hover, a `scale-95` press effect on `:active`, and `touch-action: manipulation` globally on `a`/`button` for instant mobile tap response.

## Component-Based Structure

- **`RoomCard`** — the reusable room summary card (image, price, capacity, amenities, "View Details" / "Book Now") used on the homepage, the rooms listing, and the "You May Also Like" section.
- **`RoomsGrid`** — client-side wrapper around `RoomCard` that adds the All/Master/Twin filter tabs.
- **`BookingSidebar`** — sticky price/date-picker/booking widget on the room detail page.
- **`StepIndicator`** — the 3-step progress UI (Guest Details → Summary → Payment) on the booking page.
- **`Navbar` / `Footer` / `WhatsAppButton`** — shared public site chrome; the WhatsApp button links out with a pre-filled inquiry message.
- **`Sidebar`** — manager portal navigation (dashboard/bookings/rooms + logout).
- **`BookingsTable` / `BookingDetail` / `StatusBadge`** — portal booking-management UI, including live Confirm/Reject actions against the API.
- **`Skeleton` / `RoomCardSkeleton` / `BookingRowSkeleton` / `Spinner`** — loading states used in `loading.tsx` route files and in-flight button states.
- **`components/ui/*`** — shadcn/ui primitives (Button, Card, Badge, Input, Label, Sheet, Textarea, Separator) that everything else is built from.
- **Currency Converter** (`/currency`) — fetches live PKR exchange rates from the free [open.er-api.com](https://www.exchangerate-api.com/docs/free) API (no key required), with a real-time search/filter over the currency list and a live PKR-amount converter so guests can check room prices in their own currency.
- **Amenities** — full CRUD feature backed by a real `amenities` table (self-built API routes, not a third-party service). Public read access; create/update/delete are restricted to authenticated managers via RLS and an explicit server-side session check in every write route. Managed from `/dashboard/amenities` (create form, inline edit, confirm-before-delete) and surfaced read-only in a "Hotel Amenities" section on the homepage.
- **Guest Account System** (`/account`) — separate customer-facing auth from the manager portal, also via Supabase Auth. `/account/signup` and `/account/login` handle signup/login with per-field client-side validation; `/account` is a protected "My Bookings" page that fetches the logged-in guest's own bookings (matched by their session email, verified server-side) with loading/error/empty states and a confirm-before-logout step. The manager account is tagged `role: "manager"` in `app_metadata` (settable only by the service role) so a guest signup can never reach `/dashboard`.
- **Reviews** (`/reviews`) — a 7-field guest review form (name, email, room dropdown, stay date, rating dropdown, review text, optional photo) with client- and server-side validation, plus a duplicate-email confirm step and a "Recent Reviews" list read from the same table.
- **`FileDropzone`** (`components/upload/FileDropzone.tsx`) — reusable drag-and-drop image picker used for the review photo: drag-over highlight, click-to-browse fallback, instant client-side type/size validation, a thumbnail preview once a file is chosen, and a live progress bar during upload. Submission goes through `lib/uploadWithProgress.ts`, which uses `XMLHttpRequest` instead of `fetch()` specifically because `fetch` has no upload-progress event — `xhr.upload.onprogress` is the only browser API that exposes real (not simulated) progress. The photo lands in a public Supabase Storage bucket and its URL is shown back as an image preview on the success screen.

## Global State Management

Two small React Context providers cover the app's actual shared-state needs — no Redux/Zustand, since the state involved (a session object, a list of toast messages) doesn't need middleware, devtools, or cross-tab sync to justify a library on top of what React already ships.

- **`AuthContext`** (mounted in `app/(public)/layout.tsx`) — holds the guest's Supabase Auth session. Before this existed, both `Navbar` (to decide the "My Bookings" link target) and the `/account` page (to display the guest's name/email) ran their *own* `getUser()` + `onAuthStateChange` subscription, duplicating the same fetch. Both now just call `useAuth()`.
- **`ToastContext`** (mounted once in the root `app/layout.tsx`, so it's available on both the public site and the manager portal) — a `success()`/`error()` API backing a floating toast stack in the bottom-right corner. The manager portal's Amenities page and the guest Review form previously each built their own local "banner" state and JSX for this; both now call `useToast()` instead, and the interactive bits that a passive toast can't express (e.g. the review form's Yes/No duplicate-email confirmation) stay as local component state, which is exactly the kind of state that *shouldn't* move into a global store.

## Responsive Behavior

The layout is mobile-first throughout, using Tailwind's `sm:` (640px), `md:` (768px), and `lg:` (1024px) breakpoints:

- **Room grids** (`RoomsGrid`, home page, gallery) go `grid-cols-1` on mobile → `sm:grid-cols-2` on tablet → `lg:grid-cols-3` on desktop.
- **Navbar** collapses its horizontal link list into a `Sheet` slide-out drawer below `md:`, triggered by a hamburger icon.
- **Room detail page** stacks the image gallery above the booking sidebar on mobile (`grid-cols-1`) and switches to a two-column `lg:grid-cols-[1fr_380px]` layout on desktop, where the sidebar becomes sticky.
- **Manager portal sidebar** is hidden on mobile in favor of a top bar + slide-out `Sheet`, and becomes a fixed 250px sidebar at `md:`.
- **Hero, section padding, and typography** scale up via responsive utilities (e.g. `text-4xl md:text-5xl`, `py-16 md:py-28`) rather than fixed breakpoints, so spacing feels proportional at every screen size.

## Getting Started

**Prerequisites:** Node.js 20+, a Supabase project (see `supabase/schema.sql` for the schema).

```bash
# Install dependencies
npm install

# Create .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site, or [http://localhost:3000/login](http://localhost:3000/login) for the manager portal.

> **Note:** Email confirmation for guest signups (`/account/signup`) is currently turned **off** in Supabase (Authentication → Sign In / Providers → Email → "Confirm email") for easier testing — new accounts get a session immediately instead of waiting on a confirmation email. Supabase's default email sender also has a strict rate limit, which is part of why this is off for now. Before real guests use this in production, re-enable email confirmation and connect a proper SMTP provider (e.g. Resend) in Supabase's Auth settings.

```bash
# Production build
npm run build
npm run start
```
