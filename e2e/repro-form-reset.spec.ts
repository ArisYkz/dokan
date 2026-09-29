import { test, expect, type Page } from "@playwright/test";

// ============================================================================
// Regression tests for the dashboard product sheet:
//   1. viewport resize (F12 device mode) must NOT close the sheet or wipe input
//   2. the crop overlay must be clickable and must NOT dismiss the sheet
//   3. the add-product draft must survive close/reopen until saved
// ============================================================================

const PNG_100 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAeElEQVR4nO3PMREAAAgDoJc/DC5A" +
    "gAErMBHJWHVatWvXrl27du3atWvXrl27du3atWvXrl27du3atWvXrl27du3atWvXrl27du3atWvX" +
    "rl27du3atWvXrl27du3atWvXrl27du3atWvXrl27du3atWvXrl27d60b4QFOoAKbKAAAAABJRU5ErkJggg==",
  "base64",
);

async function login(page: Page) {
  page.on("pageerror", (err) => console.log("[pageerror]", err.message));
  page.on("console", (m) => { if (m.type() === "error") console.log("[console.error]", m.text().slice(0, 300)); });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/auth");
  const accept = page.getByRole("button", { name: /গ্রহণ|accept/i });
  if (await accept.isVisible({ timeout: 2_000 }).catch(() => false)) await accept.click();
  await page.waitForSelector('input[type="email"]', { timeout: 10_000 });
  await page.locator('input[type="email"]').fill("playwright-test@dokan.com");
  await page.locator('input[type="password"]').fill("TestPass123!");
  await page.locator("form").getByRole("button", { name: /লগ ইন|log in|войти|кіру/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  // Create store if prompted (form may take a while to render)
  const storeHeading = page.getByRole("heading", { name: /দোকান তৈরি করুন|create.*store/i });
  const needsStore = await storeHeading.waitFor({ state: "visible", timeout: 8_000 }).then(() => true).catch(() => false);
  if (needsStore) {
    const createStoreBtn = page.getByRole("button", { name: /তৈরি করুন|create/i }).last();
    await page.locator("input").nth(0).fill("Repro Store");
    await page.locator("input").nth(1).fill(`reprostore${Date.now().toString(36)}`);
    await createStoreBtn.click();
  }
  // Wait for the products tab UI
  await page.getByRole("button", { name: /^(\+ )?(Add|যোগ করুন)$/i }).first().waitFor({ timeout: 20_000 });
}

async function openAddProductSheet(page: Page) {
  const addBtn = page.getByRole("button", { name: /^(\+ )?(Add|যোগ করুন)$/i }).first();
  await addBtn.click({ timeout: 10_000 });
  await page.getByRole("button", { name: /single item/i }).click();
  await expect(page.getByText(/পণ্য যোগ করুন|Add Product/i).first()).toBeVisible({ timeout: 5_000 });
}

const sheetTitle = (page: Page) => page.getByText(/পণ্য যোগ করুন|Add Product/i).first();

test("viewport resize keeps the product sheet open with input preserved", async ({ page }) => {
  await login(page);
  await openAddProductSheet(page);

  const inputs = page.locator("form input");
  await inputs.nth(0).fill("Test Product");
  await inputs.nth(1).fill("199");

  // Simulate F12 device-mode toggle across the mobile breakpoint
  await page.setViewportSize({ width: 375, height: 800 });
  await expect(sheetTitle(page)).toBeVisible({ timeout: 5_000 });
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(sheetTitle(page)).toBeVisible({ timeout: 5_000 });

  expect(await inputs.nth(0).inputValue()).toBe("Test Product");
  expect(await inputs.nth(1).inputValue()).toBe("199");
});

test("crop overlay is clickable and does not dismiss the product sheet", async ({ page }) => {
  await login(page);
  await openAddProductSheet(page);

  const fileInput = page.locator('input[type="file"][accept="image/*"]');
  await fileInput.setInputFiles({ name: "test.png", mimeType: "image/png", buffer: PNG_100 });

  const cropBtn = page.getByRole("button", { name: /ক্রপ ও আপলোড|crop & upload/i });
  await expect(cropBtn).toBeVisible({ timeout: 5_000 });

  // THE FAILING ACTION: click Crop & Upload
  await cropBtn.click({ timeout: 3_000 });

  // The sheet (Add Product title) must still be visible
  await expect(sheetTitle(page)).toBeVisible({ timeout: 3_000 });
});

test("add-product draft survives sheet close/reopen until saved", async ({ page }) => {
  await login(page);
  await openAddProductSheet(page);

  const inputs = page.locator("form input");
  await inputs.nth(0).fill("Draft Product");

  // Close via Cancel
  await page.getByRole("button", { name: /বাতিল|cancel/i }).click();
  await expect(sheetTitle(page)).toBeHidden({ timeout: 3_000 });

  // Reopen Add -> Single Item; the draft must still be there
  await openAddProductSheet(page);
  expect(await page.locator("form input").nth(0).inputValue()).toBe("Draft Product");
});
