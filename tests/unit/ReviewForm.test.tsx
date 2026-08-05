import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ToastProvider } from "@/context/ToastContext";
import type { Room } from "@/components/rooms/RoomCard";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => <img alt={props.alt} src={props.src} />,
}));

const rooms: Room[] = [
  { id: "room-1", slug: "master-1", name: "Master Room 1", type: "master", price: 7000, capacity: 2, amenities: [] },
];

function renderForm() {
  return render(
    <ToastProvider>
      <ReviewForm rooms={rooms} />
    </ToastProvider>
  );
}

describe("ReviewForm validation", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows a field-specific error for every required field on an empty submit", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a room/i)).toBeInTheDocument();
    expect(screen.getByText(/stay date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/select a rating/i)).toBeInTheDocument();
    expect(screen.getByText(/review text is required/i)).toBeInTheDocument();

    // Client-side validation should stop the request before it ever fires.
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows an email-format error for an invalid address instead of a generic message", async () => {
    renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), "Ahmed Khan");
    await user.type(screen.getByLabelText(/^email$/i), "not-an-email");
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a review shorter than 10 characters", async () => {
    renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/your review/i), "too short");
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();
  });
});
