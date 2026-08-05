import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }),
}));

describe("Navbar", () => {
  it("renders every main navigation link", () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    for (const label of ["Home", "Rooms", "Gallery", "Currency", "About", "Contact"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("points the My Bookings link at /account/login when signed out", async () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    const links = await screen.findAllByRole("link", { name: /my bookings/i });
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/account/login");
    }
  });
});
