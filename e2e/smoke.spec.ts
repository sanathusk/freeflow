import { test, expect } from "@playwright/test";

test.describe("FreeFlow Smoke Suite", () => {
  test("renders Welcome Screen on initial launch", async ({ page }) => {
    await page.goto("/");

    // Check title and brand header
    await expect(page.locator("h1")).toContainText("FreeFlow");
    await expect(page.getByText("Create New Mindmap")).toBeVisible();
    await expect(page.getByText("Open Existing .canvas")).toBeVisible();
    await expect(page.getByText("ff-note.canvas")).toBeVisible();
  });
});
