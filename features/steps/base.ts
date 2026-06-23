import { createBdd } from "playwright-bdd";

// Shared BDD step builders. Custom fixtures can be layered here later.
export const { Given, When, Then } = createBdd();
