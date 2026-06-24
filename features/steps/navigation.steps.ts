import { expect } from "@playwright/test";
import { Given, When, Then } from "./base";

Given("I open {string}", async ({ page }, path: string) => {
  await page.goto(path);
});

Then("I should see the audio button", async ({ page }) => {
  await expect(page.getByRole("button", { name: /hear/i }).first()).toBeVisible();
});

// Tap the correct card each round (data-correct is the e2e contract) until the
// result screen appears. Waits cover the dev compile + post-correct advance.
When("I complete the hut", async ({ page }) => {
  for (let i = 0; i < 8; i++) {
    if (await page.getByText("Play again").count()) break;
    const correct = page.locator('[data-correct="true"]').first();
    await correct.waitFor({ state: "visible", timeout: 15_000 });
    await correct.click();
    await page.waitForTimeout(1200);
  }
});

When("I tap {string}", async ({ page }, name: string) => {
  // All tap targets are navigation links. getByRole(...).click() auto-waits for
  // the link to render, which absorbs the inter-screen navigation/hydration race.
  await page.getByRole("link", { name }).first().click();
});

Then("the {string} control is not a link", async ({ page }, name: string) => {
  // Locked islands render as a plain div with an aria-label, never an <a>.
  await expect(page.getByText("Animals").first()).toBeVisible();
  await expect(page.getByRole("link", { name })).toHaveCount(0);
});
