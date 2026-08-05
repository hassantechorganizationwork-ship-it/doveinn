import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { createSupabaseMock } from "../helpers/supabaseMock";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const adminMock = { current: createSupabaseMock() };
const serverMock = { current: createSupabaseMock() };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => adminMock.current,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => serverMock.current,
}));

import { GET, POST } from "@/app/api/amenities/route";

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/amenities", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/amenities", () => {
  it("returns the amenity list on success (happy path)", async () => {
    adminMock.current = createSupabaseMock([
      { data: [{ id: "1", name: "Free WiFi" }], error: null },
    ]);
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
  });

  it("returns 500 when the database errors (failure path)", async () => {
    adminMock.current = createSupabaseMock([
      { data: null, error: { message: "connection failed" } },
    ]);
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
  });
});

describe("POST /api/amenities", () => {
  beforeEach(() => {
    serverMock.current = createSupabaseMock();
  });

  it("returns 401 when no user is signed in (failure path)", async () => {
    serverMock.current.auth.getUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(jsonRequest({ name: "Pool" }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 400 when name is missing (failure path)", async () => {
    serverMock.current.auth.getUser.mockResolvedValue({
      data: { user: { id: "manager-1" } },
    });

    const res = await POST(jsonRequest({ description: "no name given" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/name is required/i);
  });

  it("creates the amenity when authenticated with a valid name (happy path)", async () => {
    serverMock.current = createSupabaseMock([
      { data: { id: "2", name: "Swimming Pool" }, error: null },
    ]);
    serverMock.current.auth.getUser.mockResolvedValue({
      data: { user: { id: "manager-1" } },
    });

    const res = await POST(jsonRequest({ name: "Swimming Pool" }));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Swimming Pool");
  });
});
