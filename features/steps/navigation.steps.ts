import { expect } from "@playwright/test";
import { When, Then } from "./base";

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
