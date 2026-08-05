import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { createSupabaseMock } from "../helpers/supabaseMock";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const serverMock = { current: createSupabaseMock() };
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => serverMock.current,
}));

import { PATCH, DELETE } from "@/app/api/amenities/[id]/route";

function patchRequest(body: unknown) {
  return new NextRequest("http://localhost/api/amenities/abc", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const params = Promise.resolve({ id: "abc" });

describe("PATCH /api/amenities/[id]", () => {
  beforeEach(() => {
    serverMock.current = createSupabaseMock();
  });

  it("returns 401 when no user is signed in (failure path)", async () => {
    serverMock.current.auth.getUser.mockResolvedValue({ data: { user: null } });

    const res = await PATCH(patchRequest({ name: "Updated" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the amenity doesn't exist (failure path)", async () => {
    serverMock.current = createSupabaseMock([{ data: null, error: null }]);
    serverMock.current.auth.getUser.mockResolvedValue({
      data: { user: { id: "manager-1" } },
    });

    const res = await PATCH(patchRequest({ name: "Updated" }), { params });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toMatch(/not found/i);
  });

  it("updates the amenity when found (happy path)", async () => {
    serverMock.current = createSupabaseMock([
      { data: { id: "abc", name: "Updated Name" }, error: null },
    ]);
    serverMock.current.auth.getUser.mockResolvedValue({
      data: { user: { id: "manager-1" } },
    });

    const res = await PATCH(patchRequest({ name: "Updated Name" }), { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.name).toBe("Updated Name");
  });
});

describe("DELETE /api/amenities/[id]", () => {
  beforeEach(() => {
    serverMock.current = createSupabaseMock();
  });

  it("returns 401 when no user is signed in (failure path)", async () => {
    serverMock.current.auth.getUser.mockResolvedValue({ data: { user: null } });

    const res = await DELETE(new NextRequest("http://localhost/api/amenities/abc"), {
      params,
    });
    expect(res.status).toBe(401);
  });

  it("deletes the amenity when found (happy path)", async () => {
    serverMock.current = createSupabaseMock([{ data: { id: "abc" }, error: null }]);
    serverMock.current.auth.getUser.mockResolvedValue({
      data: { user: { id: "manager-1" } },
    });

    const res = await DELETE(new NextRequest("http://localhost/api/amenities/abc"), {
      params,
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
