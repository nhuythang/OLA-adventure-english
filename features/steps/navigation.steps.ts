import { expect } from "@playwright/test";
import { Given, When, Then } from "./base";

Given("I open {string}", async ({ page }, path: string) => {
  await page.goto(path);
});

Then("I should see the audio button", async ({ page }) => {
  await expect(page.getByRole("button", { name: /hear/i }).first()).toBeVisible();
});

Then("I should see the trace pad", async ({ page }) => {
  await expect(page.getByTestId("trace-pad")).toBeVisible();
});

// Tap a self-rate star each round until the result appears (Speak L1 / no-ASR).
When("I self-rate through the hut", async ({ page }) => {
  for (let round = 0; round < 8; round++) {
    if (await page.getByText("Keep going").count()) break;
    const star = page.getByTestId("self-rate-star").first();
    await star.waitFor({ state: "visible", timeout: 15_000 });
    await star.click();
    await page.waitForTimeout(1000);
  }
});

// Sweep the pointer densely across the trace pad to light every waypoint, for
// each round, until the result screen appears.
When("I trace every letter", async ({ page }) => {
  for (let round = 0; round < 12; round++) {
    if (await page.getByText("Play again").count()) break;
    const pad = page.getByTestId("trace-pad");
    if (!(await pad.count())) break;
    await pad.waitFor({ state: "visible", timeout: 15_000 });
    // Wait until waypoints are sampled (data-waypoints > 0) before sweeping.
    await pad.evaluate((el) => new Promise<void>((res) => {
      const check = () => (Number(el.getAttribute("data-waypoints")) > 0 ? res() : setTimeout(check, 50));
      check();
    }));
    const box = await pad.boundingBox();
    if (!box) break;
    // Start the press at the center (over the SVG content, not its border) so
    // pointerdown registers, then sweep the whole pad.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    const cols = 14;
    const rows = 14;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = r % 2 === 0 ? c : cols - 1 - c;
        await page.mouse.move(
          box.x + ((cx + 0.5) * box.width) / cols,
          box.y + ((r + 0.5) * box.height) / rows,
        );
      }
    }
    await page.mouse.up();
    await page.waitForTimeout(1100);
  }
});

// Tap the correct card each round (data-correct is the e2e contract) until the
// result screen appears. Waits cover the dev compile + post-correct advance.
When("I complete the hut", async ({ page }) => {
  for (let i = 0; i < 8; i++) {
    if (await page.getByText("Keep going").count()) break;
    const correct = page.locator('[data-correct="true"]').first();
    await correct.waitFor({ state: "visible", timeout: 15_000 });
    await correct.click();
    await page.waitForTimeout(1200);
  }
});

Given("I reload the page", async ({ page }) => {
  await page.reload();
});

When("I toggle the {string} level", async ({ page }, skill: string) => {
  await page.getByTestId(`level-${skill}`).click();
});

Then("the {string} level shows {string}", async ({ page }, skill: string, level: string) => {
  await expect(page.getByTestId(`level-${skill}`)).toContainText(level);
});

When("I tap {string}", async ({ page }, name: string) => {
  // Match a link (navigation) OR a button (e.g. "Keep going" in the reward
  // overlay). .or().first().click() auto-waits for either to render, absorbing
  // the post-navigation render race (a bare .count() would not wait).
  await page
    .getByRole("link", { name })
    .or(page.getByRole("button", { name }))
    .first()
    .click();
});

Then("the {string} control is not a link", async ({ page }, name: string) => {
  // Locked islands render as a plain div with an aria-label, never an <a>.
  await expect(page.getByText("Animals").first()).toBeVisible();
  await expect(page.getByRole("link", { name })).toHaveCount(0);
});
