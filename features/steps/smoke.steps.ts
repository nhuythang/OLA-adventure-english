import { expect } from "@playwright/test";
import { Given, Then } from "./base";

Given("I open the home screen", async ({ page }) => {
  await page.goto("/");
});

Then("I should see {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
});
