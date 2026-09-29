import { test, expect, type Page } from "@playwright/test";

// ============================================================================
// Reproduction: crop modal broken when opened from ProductEditModal (Radix Sheet)
// Symptoms: "crop not working", "can't add product image via Edit / Add > Single Item"
// ============================================================================

test.use({ baseURL: "http://localhost:8082" });

async function login(page: Page) {
  await page.goto("/auth");
  const accept = page.getByRole("button", { name: /গ্রহণ|accept/i });
  if (await accept.isVisible({ timeout: 2_000 }).catch(() => false)) await accept.click();
  await page.waitForSelector('input[type="email"]', { timeout: 10_000 });
  await page.locator('input[type="email"]').fill("playwright-test@dokan.com");
  await page.locator('input[type="password"]').fill("TestPass123!");
  await page.locator("form").getByRole("button", { name: /লগ ইন|log in|войти|кіру/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });

  // Fresh account: create a store if prompted
  const createStoreBtn = page.getByRole("button", { name: /তৈরি করুন|create/i }).last();
  if (await createStoreBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await page.locator("input").nth(0).fill("Repro Store");
    await page.locator("input").nth(1).fill("reprostore");
    await createStoreBtn.click();
    await page.waitForTimeout(2_000);
  }
}

// 100x100 red PNG
const PNG_100 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAeElEQVR4nO3PMREAAAgDoJc/DC5A" +
    "gAErMBHJWHVatWvXrl27du3atWvXrl27du3atWvXrl27du3atWvXrl27du3atWvXrl27du3atWvX" +
    "rl27du3atWvXrl27du3atWvXrl27du3atWvXrl27du3atWvXrl27du3atWvXrl27d60b4QFOoAKb" +
    "KAAAAABJRU5ErkJggg==",
  "base64",
);

test("repro: crop modal from product sheet is interactable", async ({ page }) => {
  await login(page);

  // Open Products tab (sidebar nav)
  await page.locator("nav").getByRole("button", { name: /products|продукты|পণ্য/i }).click();
  await page.waitForLoadState("networkidle");

  // Open the Add menu → Single Item
  await page.getByRole("button", { name: /^Add$|Add$/ }).first().click();
  await page.getByRole("button", { name: /single item/i }).click();

  // Sheet should be open with "Add Product" title
  await expect(page.getByText(/Add Product/i)).toBeVisible({ timeout: 5_000 });

  // Upload a file through the crop-upload hidden input (inside the sheet)
  const fileInput = page.locator('input[type="file"][accept="image/*"]');
  await fileInput.setInputFiles({ name: "test.png", mimeType: "image/png", buffer: PNG_100 });

  // Crop modal should appear (react-easy-crop)
  const cropButton = page.getByRole("button", { name: /crop & upload|crop upload/i });
  await expect(cropButton).toBeVisible({ timeout: 5_000 });

  // Evidence: body pointer-events state while crop modal is open
  const bodyPointerEvents = await page.evaluate(() => getComputedStyle(document.body).pointerEvents);
  console.log(">> body pointer-events while sheet open:", bodyPointerEvents);

  // THE FAILING ACTION: click Crop & Upload
  await cropButton.click({ timeout: 3_000 });

  // Upload proceeds — either success toast or storage error toast appears,
  // but the button click itself must register.
});
