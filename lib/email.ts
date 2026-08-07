import { Resend } from "resend";

// Booking receipt/notification emails, kept separate from Supabase Auth's
// own confirmation emails (those go through Supabase's SMTP settings, not
// this client) — this is for the transactional emails the app itself sends
// when a booking is created.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "Dove Inn Hotel <onboarding@resend.dev>";
const HOTEL_EMAIL = process.env.HOTEL_NOTIFICATION_EMAIL;

type BookingReceiptInput = {
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  advanceAmount: number;
};

const money = (n: number) => `Rs ${n.toLocaleString()}`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doveinn-five.vercel.app";
const receiptUrl = (ref: string, email: string) =>
  `${SITE_URL}/receipt/${encodeURIComponent(ref)}?email=${encodeURIComponent(email)}`;
const receiptButton = (ref: string, email: string) => `
  <p style="margin-top:20px;text-align:center;">
    <a href="${receiptUrl(ref, email)}" style="display:inline-block;background:#8A6D1F;color:#fff;text-decoration:none;padding:10px 22px;border-radius:6px;font-size:14px;font-weight:bold;">View / Download Receipt</a>
  </p>
`;

function receiptHtml(b: BookingReceiptInput) {
  const remaining = b.totalAmount - b.advanceAmount;
  return `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;color:#1C1C1C;">
      <h1 style="font-size:20px;margin:0 0 4px;">Dove Inn Hotel</h1>
      <p style="color:#7B7466;margin:0 0 24px;font-size:13px;">Booking Request Received</p>
      <p>Hi ${b.guestName},</p>
      <p>Thanks for booking with us. Here's a copy of your request for your records:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;color:#7B7466;">Booking Ref</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${b.bookingRef}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Room</td><td style="padding:6px 0;text-align:right;">${b.roomName}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Check-in</td><td style="padding:6px 0;text-align:right;">${b.checkIn}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Check-out</td><td style="padding:6px 0;text-align:right;">${b.checkOut}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Total Amount</td><td style="padding:6px 0;text-align:right;">${money(b.totalAmount)}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Advance (bank transfer)</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#8A6D1F;">${money(b.advanceAmount)}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Remaining (pay at hotel)</td><td style="padding:6px 0;text-align:right;">${money(remaining)}</td></tr>
      </table>
      <p style="background:#FBF1E2;border-radius:6px;padding:12px;font-size:14px;">Your booking is under review. Our team will contact you within 2-4 hours to confirm your reservation.</p>
      ${receiptButton(b.bookingRef, b.guestEmail)}
      <p style="color:#7B7466;font-size:12px;margin-top:24px;">Dove Inn Hotel · Taiba Colony, Hazrat Ali Street, Sharaqpur Sharif</p>
    </div>
  `;
}

function notifyHotelHtml(b: BookingReceiptInput) {
  return `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;color:#1C1C1C;">
      <h1 style="font-size:18px;margin:0 0 16px;">New booking request — ${b.bookingRef}</h1>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#7B7466;">Guest</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${b.guestName}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Phone</td><td style="padding:6px 0;text-align:right;">${b.guestPhone}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Email</td><td style="padding:6px 0;text-align:right;">${b.guestEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Room</td><td style="padding:6px 0;text-align:right;">${b.roomName}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Dates</td><td style="padding:6px 0;text-align:right;">${b.checkIn} → ${b.checkOut}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Total / Advance</td><td style="padding:6px 0;text-align:right;">${money(b.totalAmount)} / ${money(b.advanceAmount)}</td></tr>
      </table>
      <p style="margin-top:16px;"><a href="https://doveinn-five.vercel.app/dashboard/bookings" style="color:#8A6D1F;">Open in manager portal →</a></p>
    </div>
  `;
}

type BookingConfirmedInput = {
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  advanceAmount: number;
};

function confirmedHtml(b: BookingConfirmedInput) {
  return `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;color:#1C1C1C;">
      <h1 style="font-size:20px;margin:0 0 4px;">Dove Inn Hotel</h1>
      <p style="color:#15803D;font-weight:bold;margin:0 0 24px;font-size:15px;">✓ Booking Confirmed</p>
      <p>Hi ${b.guestName},</p>
      <p>We've received your advance payment and your room is confirmed. We're looking forward to hosting you.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;color:#7B7466;">Booking Ref</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${b.bookingRef}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Room</td><td style="padding:6px 0;text-align:right;">${b.roomName}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Check-in</td><td style="padding:6px 0;text-align:right;">${b.checkIn}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Check-out</td><td style="padding:6px 0;text-align:right;">${b.checkOut}</td></tr>
        <tr><td style="padding:6px 0;color:#7B7466;">Advance Received</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#15803D;">${money(b.advanceAmount)}</td></tr>
      </table>
      <p style="background:#EBF4EE;border-radius:6px;padding:12px;font-size:14px;">The remaining balance is payable at the hotel on arrival. Thank you for choosing Dove Inn Hotel — see you soon!</p>
      ${receiptButton(b.bookingRef, b.guestEmail)}
      <p style="color:#7B7466;font-size:12px;margin-top:24px;">Dove Inn Hotel · Taiba Colony, Hazrat Ali Street, Sharaqpur Sharif</p>
    </div>
  `;
}

export async function sendBookingConfirmedEmail(input: BookingConfirmedInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping confirmation email.");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: input.guestEmail,
      subject: `Booking Confirmed — ${input.bookingRef} | Dove Inn Hotel`,
      html: confirmedHtml(input),
    });
  } catch (err) {
    console.error("sendBookingConfirmedEmail failed:", err);
  }
}

// Fire-and-forget from the caller's point of view: a guest's booking must
// succeed even if the email provider is down or misconfigured, so failures
// here are logged, not thrown.
export async function sendBookingEmails(input: BookingReceiptInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping booking emails.");
    return;
  }

  const results = await Promise.allSettled([
    resend.emails.send({
      from: FROM,
      to: input.guestEmail,
      subject: `Booking Received — ${input.bookingRef} | Dove Inn Hotel`,
      html: receiptHtml(input),
    }),
    HOTEL_EMAIL
      ? resend.emails.send({
          from: FROM,
          to: HOTEL_EMAIL,
          subject: `New Booking: ${input.bookingRef} (${input.guestName})`,
          html: notifyHotelHtml(input),
        })
      : Promise.resolve(),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Booking email failed to send:", result.reason);
    }
  }
}
