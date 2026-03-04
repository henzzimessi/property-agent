import { expect, test } from "@playwright/test";

test("create, update, delete agent", async ({ page }) => {
  const stamp = Date.now();
  const email = `e2e-${stamp}@purehr.com`;

  await page.goto("/");

  await page.getByTestId("first-name").fill("E2E");
  await page.getByTestId("last-name").fill("Tester");
  await page.getByTestId("email").fill(email);
  await page.getByTestId("mobile-number").fill("555-000-0000");
  await page.getByTestId("submit-agent").click();

  const row = page.locator("tr", { hasText: email });
  await expect(row).toBeVisible();

  await row.getByText("Edit").click();
  await page.getByTestId("mobile-number").fill("555-999-0000");
  await page.getByTestId("submit-agent").click();

  await expect(row).toContainText("555-999-0000");

  await row.getByText("Delete").click();
  await expect(row).toHaveCount(0);
});
