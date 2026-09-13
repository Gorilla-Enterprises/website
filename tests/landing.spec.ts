import { test, expect } from "@playwright/test";

test("landing page shows the Gorilla Enterprises mark, wordmark, and dateline", async ({
  page,
}) => {
  await page.goto("/");

  const mark = page.getByRole("img", { name: "Gorilla Enterprises" });
  await expect(mark).toBeVisible();
  // toBeVisible() alone passes even for a broken src (the alt-text box still
  // paints), so also confirm the image data actually decoded.
  await expect
    .poll(() => mark.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.getByText("Gorilla", { exact: true })).toBeVisible();
  await expect(page.getByText("Enterprises", { exact: true })).toBeVisible();
  await expect(page.getByText("July 2027")).toBeVisible();
  await expect(page.getByText("Rwanda")).toBeVisible();
});
