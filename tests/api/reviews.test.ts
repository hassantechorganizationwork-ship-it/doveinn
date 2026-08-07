import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { createSupabaseMock } from "../helpers/supabaseMock";

const adminMock = { current: createSupabaseMock() };
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => adminMock.current,
}));

import { GET, POST } from "@/app/api/reviews/route";

function formRequest(fields: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value);
  }
  return new NextRequest("http://localhost/api/reviews", {
    method: "POST",
    body: form,
  });
}

const validFields = {
  guest_name: "Ahmed Khan",
  guest_email: "ahmed@example.com",
  room_id: "room-1",
  stay_date: "2026-01-01",
  rating: "5",
  review_text: "Loved every bit of the stay here!",
};

function getRequest() {
  return new NextRequest("http://localhost/api/reviews");
}

describe("GET /api/reviews", () => {
  it("returns recent reviews (happy path)", async () => {
    adminMock.current = createSupabaseMock([
      { data: [{ id: "r1", guest_name: "Ahmed" }], error: null },
    ]);

    const res = await GET(getRequest());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
  });

  it("returns 500 when the database errors (failure path)", async () => {
    adminMock.current = createSupabaseMock([
      { data: null, error: { message: "db down" } },
    ]);

    const res = await GET(getRequest());
    expect(res.status).toBe(500);
  });
});

describe("POST /api/reviews", () => {
  it("returns 400 with a field error per missing field (failure path)", async () => {
    adminMock.current = createSupabaseMock();

    const res = await POST(formRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.fieldErrors.guest_name).toMatch(/required/i);
    expect(json.fieldErrors.guest_email).toMatch(/required/i);
    expect(json.fieldErrors.review_text).toMatch(/required/i);
  });

  it("rejects an invalid email even when every other field is valid (failure path)", async () => {
    adminMock.current = createSupabaseMock();

    const res = await POST(formRequest({ ...validFields, guest_email: "not-an-email" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.fieldErrors.guest_email).toMatch(/valid email/i);
  });

  it("returns a 409 duplicate prompt when the email already has a review", async () => {
    // Call order: rooms lookup (exists), then reviews count check (count: 1)
    adminMock.current = createSupabaseMock([
      { data: { id: "room-1" }, error: null },
      { data: null, error: null, count: 1 },
    ]);

    const res = await POST(formRequest(validFields));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.duplicate).toBe(true);
    expect(json.error).toMatch(/once/i);
  });

  it("creates the review on a fresh email with no photo (happy path)", async () => {
    // Call order: rooms lookup (exists), reviews count check (count: 0), insert
    adminMock.current = createSupabaseMock([
      { data: { id: "room-1" }, error: null },
      { data: null, error: null, count: 0 },
      { data: { id: "rev-1", ...validFields }, error: null },
    ]);

    const res = await POST(formRequest(validFields));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.isRepeat).toBe(false);
  });
});
