import { expect } from "@playwright/test";
import { When, Then } from "./base";

Then("I should see the audio button", async ({ page }) => {
  await expect(page.getByRole("button", { name: /hear/i }).first()).toBeVisible();
});

When("I tap the {string} choice", async ({ page }, word: string) => {
  await page.locator(`[data-choice="${word}"]`).click();
});

Then("the {string} choice is marked {string}", async ({ page }, word: string, state: string) => {
  await expect(page.locator(`[data-choice="${word}"]`)).toHaveAttribute("data-state", state);
});
