import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const outputDir = path.join(rootDir, "docs", "screenshots");

const baseUrl = process.env.SCREENSHOT_SITE_URL || "https://ecommerece-mern-web.vercel.app";
const apiBase =
  (process.env.SCREENSHOT_API_URL || "https://backend-two-weld-46.vercel.app/api").replace(/\/$/, "");

async function firstProductId() {
  const res = await fetch(`${apiBase}/products?limit=1`);
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data) && data[0]?._id) return data[0]._id;
  if (data?.items?.[0]?._id) return data.items[0]._id;
  return null;
}

const staticPages = [
  { name: "home", url: () => `${baseUrl}/` },
  { name: "auth", url: () => `${baseUrl}/auth` },
  { name: "cart", url: () => `${baseUrl}/cart` },
  { name: "checkout", url: () => `${baseUrl}/checkout` },
  { name: "admin", url: () => `${baseUrl}/admin/products` },
];

async function capture() {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });

  for (const item of staticPages) {
    await page.goto(item.url(), { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(outputDir, `${item.name}.png`),
      fullPage: true,
    });
    console.log(`Saved ${item.name}.png`);
  }

  const id = await firstProductId();
  if (id) {
    await page.goto(`${baseUrl}/products/${id}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(outputDir, "product.png"),
      fullPage: true,
    });
    console.log("Saved product.png");
  } else {
    console.warn("Skipping product.png (could not load product id from API).");
  }

  await browser.close();
}

capture().catch((error) => {
  console.error("Screenshot capture failed:", error);
  process.exit(1);
});
