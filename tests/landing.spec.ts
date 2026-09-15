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

test("landing page renders with the @gorilla/design-system dark theme tokens", async ({
  page,
}) => {
  await page.goto("/");

  // These are @gorilla/design-system's `.dark` scope values (theme.css:
  // --ge-surface-base, --ge-ink-primary, --ge-ink-secondary, --ge-ink-muted),
  // not the site's old hand-rolled --ge-* block — the two sets of values are
  // close but not identical, so this only passes once the design system's
  // stylesheet is actually driving these colors.
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(10, 11, 10)",
  );

  const wordmark = page.getByText("Gorilla", { exact: true });
  await expect(wordmark).toHaveCSS("color", "rgb(237, 238, 234)");

  const enterprises = page.getByText("Enterprises", { exact: true });
  await expect(enterprises).toHaveCSS("color", "rgb(158, 162, 155)");

  const dateline = page.getByText("July 2027");
  await expect(dateline).toHaveCSS("color", "rgb(138, 144, 138)");
});
