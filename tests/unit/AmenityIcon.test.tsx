import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AmenityIcon } from "@/components/amenities/AmenityIcon";

describe("AmenityIcon", () => {
  it("renders a real emoji as text", () => {
    render(<AmenityIcon icon="📶" />);
    expect(screen.getByText("📶")).toBeInTheDocument();
  });

  it("maps a known keyword to an icon instead of showing the raw word", () => {
    const { container } = render(<AmenityIcon icon="pool" />);
    expect(screen.queryByText("pool")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("falls back to a checkmark icon for unrecognized text, not the raw word", () => {
    const { container } = render(<AmenityIcon icon="banana hammock" />);
    expect(screen.queryByText("banana hammock")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a fallback icon when no icon is provided", () => {
    const { container } = render(<AmenityIcon icon={null} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
