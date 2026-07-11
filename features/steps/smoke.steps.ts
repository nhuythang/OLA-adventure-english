import { expect } from "@playwright/test";
import { Given, Then } from "./base";

Given("I open the home screen", async ({ page }) => {
  await page.goto("/");
});

Then("I should see {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
});

// Rotation-agnostic: which word/sentence prints here now varies (round targets
// are randomly picked from the pool, not always the first word), so we check
// the prompt renders at all rather than a specific hardcoded word.
Then("I should see a printed word prompt", async ({ page }) => {
  await expect(page.getByTestId("hut-prompt")).toBeVisible();
});
