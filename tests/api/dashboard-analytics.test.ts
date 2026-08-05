import { describe, it, expect, vi } from "vitest";
import { createSupabaseMock } from "../helpers/supabaseMock";

const serverMock = { current: createSupabaseMock() };
const adminMock = { current: createSupabaseMock() };

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => serverMock.current,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => adminMock.current,
}));

import { GET } from "@/app/api/dashboard/analytics/route";

describe("GET /api/dashboard/analytics", () => {
  it("returns 401 for a guest (non-manager) session (failure path)", async () => {
    serverMock.current = createSupabaseMock();
    serverMock.current.auth.getUser.mockResolvedValue({
      data: { user: { id: "guest-1", app_metadata: {} } },
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 401 when nobody is signed in (failure path)", async () => {
    serverMock.current = createSupabaseMock();
    serverMock.current.auth.getUser.mockResolvedValue({ data: { user: null } });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns booking data for a manager session (happy path)", async () => {
    serverMock.current = createSupabaseMock();
    serverMock.current.auth.getUser.mockResolvedValue({
      data: { user: { id: "manager-1", app_metadata: { role: "manager" } } },
    });
    adminMock.current = createSupabaseMock([
      { data: [{ id: "b1", booking_status: "confirmed" }], error: null },
    ]);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
  });
});
