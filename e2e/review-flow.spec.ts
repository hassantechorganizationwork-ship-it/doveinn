import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Real end-to-end flow against the actual running app + real Supabase
// backend (not mocked) — matches the task's "create item -> see it appear"
// pattern: a guest fills out and submits the review form, and we verify
// the created review actually shows up, both in the UI and in the database.
const TEST_EMAIL = `e2e-${Date.now()}@example.com`;

test.afterAll(async () => {
  // Clean up the row this test created so repeated runs don't pollute the
  // real reviews table with throwaway e2e data.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const supabase = createClient(url, key);
  await supabase.from("reviews").delete().eq("guest_email", TEST_EMAIL);
});

test("guest submits a review and sees the confirmation, and it appears in the database", async ({
  page,
}) => {
  await page.goto("/reviews");

  await page.getByLabel("Full Name").fill("Playwright E2E Guest");
  await page.getByLabel("Email").fill(TEST_EMAIL);

  await page.getByLabel("Room Stayed In").click();
  await page.getByRole("option").first().click();

  await page.locator("#stay_date").fill("2026-01-15");

  await page.getByLabel("Rating").click();
  await page.getByRole("option", { name: /5 - Excellent/i }).click();

  await page
    .getByLabel("Your Review")
    .fill("This was submitted by an automated Playwright end-to-end test.");

  await page.getByRole("button", { name: /submit review/i }).click();

  // The form is fully replaced by a thank-you confirmation on success —
  // this is the "see it appear" step of the flow.
  await expect(
    page.getByText(/thank you! your review has been submitted/i)
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /write another review/i })
  ).toBeVisible();

  // Confirm it actually landed in the real database, not just the UI.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("reviews")
    .select("guest_name, guest_email")
    .eq("guest_email", TEST_EMAIL)
    .maybeSingle();

  expect(data?.guest_name).toBe("Playwright E2E Guest");
});
