import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const outputDir = path.join(rootDir, "docs", "screenshots");

const baseUrl = "https://ecommerece-mern-web.vercel.app";

const pages = [
  { name: "home", url: `${baseUrl}/` },
  { name: "auth", url: `${baseUrl}/auth` },
  { name: "cart", url: `${baseUrl}/cart` },
  { name: "checkout", url: `${baseUrl}/checkout` },
];

async function capture() {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });

  await page.context().tracing.start({ screenshots: false, snapshots: false });

  for (const item of pages) {
    await page.goto(item.url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(outputDir, `${item.name}.png`),
      fullPage: true,
    });
    console.log(`Saved ${item.name}.png`);
  }

  await browser.close();
}

capture().catch((error) => {
  console.error("Screenshot capture failed:", error);
  process.exit(1);
});
