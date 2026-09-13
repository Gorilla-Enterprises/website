import { test, expect } from "@playwright/test";

test("landing page shows the Gorilla Enterprises mark, wordmark, and dateline", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("img", { name: "Gorilla Enterprises" })).toBeVisible();
  await expect(page.getByText("Gorilla", { exact: true })).toBeVisible();
  await expect(page.getByText("Enterprises", { exact: true })).toBeVisible();
  await expect(page.getByText("July 2027")).toBeVisible();
  await expect(page.getByText("Rwanda")).toBeVisible();
});
