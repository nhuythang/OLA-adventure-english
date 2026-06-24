import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "features/**/*.feature",
  steps: "features/steps/**/*.ts",
  // Scenarios tagged @wip are written test-first (UI not built yet) and excluded
  // from CI until implemented. Remove a feature's @wip tag to activate it.
  tags: "not @wip",
});

export default defineConfig({
  testDir,
  // Routes compile on first hit under the dev server; give assertions room to
  // wait out that one-time compilation instead of the 5s default.
  expect: { timeout: 15_000 },
  // Interaction-heavy huts (e.g. tracing sweeps several rounds) need more than
  // the 30s default per-test budget under the dev server.
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "on-failure" }]],
  use: {
    // Distinct port from sibling projects (lla 3002, be-hoc 3001) to avoid clashes.
    baseURL: "http://localhost:3003",
    viewport: { width: 768, height: 1024 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      "NEXT_PUBLIC_SUPABASE_URL='' NEXT_PUBLIC_SUPABASE_ANON_KEY='' npm run dev -- --port 3003",
    url: "http://localhost:3003",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
