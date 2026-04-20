import { chromium } from "playwright";

const BASE_URL = process.env.SITE_URL || "http://localhost:5175";
const USER_EMAIL = `uitest+${Date.now()}@example.com`;
const USER_PASSWORD = "password123";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password123";

const results = [];

function record(step, status, details = "") {
  results.push({ step, status, details });
  console.log(`[${status.toUpperCase()}] ${step}${details ? ` - ${details}` : ""}`);
}

async function check(step, fn) {
  try {
    await fn();
    record(step, "pass");
  } catch (error) {
    record(step, "fail", error.message);
    throw error;
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];

  page.on("pageerror", (err) => {
    consoleErrors.push(`pageerror: ${err.message}`);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(`console.error: ${msg.text()}`);
    }
  });

  try {
    await check("1) Home page loads with products and filters", async () => {
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await page.getByText("Discover products you will love").waitFor();
      const productCards = page.locator(".product-card");
      const count = await productCards.count();
      if (count === 0) throw new Error("No product cards found");
      await page.getByPlaceholder("Search products").waitFor();
      await page.getByRole("button", { name: "Apply" }).waitFor();
    });

    await check("2) Product details page opens", async () => {
      const firstCard = page.locator(".product-card").first();
      await firstCard.getByRole("link", { name: "Details" }).click();
      await page.getByRole("button", { name: "Add to cart" }).waitFor();
      if (!page.url().includes("/products/")) throw new Error("Not on product details page");
    });

    await check("3) Add product to cart", async () => {
      await page.getByRole("button", { name: "Add to cart" }).click();
      await page.getByRole("link", { name: "View cart" }).click();
      await page.getByRole("heading", { name: "Cart" }).waitFor();
      const itemCount = await page.locator(".list-group-item").count();
      if (itemCount < 1) throw new Error("Cart has no items");
    });

    await check("4) Update cart quantity", async () => {
      const qtyInput = page.locator(".list-group-item input[type='number']").first();
      await qtyInput.fill("2");
      await page.waitForTimeout(400);
      const value = await qtyInput.inputValue();
      if (value !== "2") throw new Error(`Expected quantity 2, got ${value}`);
    });

    await check("5) Register new user", async () => {
      await page.goto(`${BASE_URL}/auth`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Don't have an account? Sign up" }).click();
      await page.locator("input[type='email']").fill(USER_EMAIL);
      await page.locator("input[type='password']").fill(USER_PASSWORD);
      await page.locator("input.form-control").first().fill("UI Test User");
      await page.getByRole("button", { name: "Create account" }).click();
      await page.getByRole("heading", { name: "User Dashboard" }).waitFor();
      if (!page.url().includes("/dashboard")) throw new Error("User not redirected to dashboard");
    });

    await check("6) Checkout creates order and shows in history", async () => {
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });
      await page.locator("input[name='fullName']").fill("UI Test User");
      await page.locator("input[name='address']").fill("123 Test Street");
      await page.locator("input[name='city']").fill("Test City");
      await page.locator("input[name='postalCode']").fill("12345");
      await page.locator("input[name='country']").fill("Testland");
      await page.getByLabel("Mock Payment").check();
      await page.getByRole("button", { name: "Place Order" }).click();
      await page.getByRole("heading", { name: "User Dashboard" }).waitFor();
      await page.waitForTimeout(1200);
      const ordersRows = page.locator("tbody tr");
      const count = await ordersRows.count();
      if (count < 1) throw new Error("Order history has no orders after checkout");
    });

    await check("7) Logout and login with new user", async () => {
      await page.getByRole("button", { name: "Logout" }).click();
      await page.getByRole("heading", { name: "Login" }).waitFor();
      await page.locator("input[type='email']").fill(USER_EMAIL);
      await page.locator("input[type='password']").fill(USER_PASSWORD);
      await page.getByRole("button", { name: "Login" }).click();
      await page.getByRole("heading", { name: "User Dashboard" }).waitFor();
    });

    await check("8) Admin dashboard CRUD and order status update", async () => {
      await page.getByRole("button", { name: "Logout" }).click();
      await page.locator("input[type='email']").fill(ADMIN_EMAIL);
      await page.locator("input[type='password']").fill(ADMIN_PASSWORD);
      await page.getByRole("button", { name: "Login" }).click();
      await page.getByRole("link", { name: "Admin" }).click();
      await page.getByRole("heading", { name: "Admin Dashboard" }).waitFor();

      const productName = `Playwright Test Product ${Date.now()}`;
      const addForm = page.locator("form.row.g-3").first();
      await addForm.locator("input").nth(0).fill(productName);
      await addForm.locator("input").nth(1).fill("Created by playwright test");
      await addForm.locator("input").nth(2).fill("49");
      await addForm.locator("input").nth(3).fill("Testing");
      await addForm.locator("input").nth(4).fill("11");
      await addForm.locator("input").nth(5).fill("https://placehold.co/600x400?text=PW");
      await page.getByRole("button", { name: "Add Product" }).click();
      await page.getByText("Product added").waitFor();

      const productRow = page.locator("tbody tr", { hasText: productName }).first();
      await productRow.getByRole("button", { name: "Edit" }).click();
      await addForm.locator("input").nth(2).fill("59");
      await page.getByRole("button", { name: "Update Product" }).click();
      await page.getByText("Product updated").waitFor();

      await productRow.getByRole("button", { name: "Delete" }).click();
      await page.waitForTimeout(700);

      const ordersTable = page.locator("table.table").nth(1);
      const firstOrderRow = ordersTable.locator("tbody tr").first();
      const orderShortId = (await firstOrderRow.locator("td").nth(0).innerText()).trim();
      const statusSelect = firstOrderRow.locator("select.form-select");
      const prev = await statusSelect.inputValue();
      const next = prev === "delivered" ? "shipped" : "delivered";

      const statusResponse = page.waitForResponse(
        (response) =>
          response.url().includes("/api/orders/") &&
          response.url().includes("/status") &&
          response.request().method() === "PATCH" &&
          response.status() === 200
      );

      await statusSelect.selectOption(next);
      await statusResponse;
      await page.waitForTimeout(700);

      const refreshedRow = ordersTable.locator("tbody tr", { hasText: orderShortId }).first();
      const now = (await refreshedRow.locator("td").nth(3).innerText()).trim().toLowerCase();
      if (now !== next) {
        throw new Error(`Order status did not update (${prev} -> ${now}, expected ${next})`);
      }
    });

    if (consoleErrors.length) {
      record("9) No blocking console/app errors", "fail", consoleErrors.slice(0, 3).join(" | "));
    } else {
      record("9) No blocking console/app errors", "pass");
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => r.status === "fail");
  console.log("\n=== Full Site Check Summary ===");
  results.forEach((r) => {
    console.log(`- ${r.status.toUpperCase()}: ${r.step}${r.details ? ` (${r.details})` : ""}`);
  });

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("\nTest execution failed:", error.message);
  process.exit(1);
});
