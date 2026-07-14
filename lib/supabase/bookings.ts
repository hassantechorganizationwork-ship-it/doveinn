export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "checked_in"
  | "checked_out";

export type PaymentStatus = "pending" | "advance_paid" | "fully_paid" | "refunded";

export type DbBooking = {
  id: string;
  booking_ref: string;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_cnic: string | null;
  check_in: string;
  check_out: string;
  total_amount: number;
  advance_amount: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  special_requests: string | null;
  manager_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingWithRoom = DbBooking & {
  rooms: {
    name: string;
    type?: "master" | "twin";
    price_per_night?: number;
  } | null;
};
