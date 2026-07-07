import { chromium } from "playwright-core";
import fs from "fs";

const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const URL = "http://localhost:5055/";
const seed = fs.readFileSync("play/seed.json", "utf8");
const outDir = "play/assets/screenshots";

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const ctx = await browser.newContext({
  viewport: { width: 412, height: 820 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
await ctx.addInitScript((s) => {
  try { localStorage.setItem("kavatza_state_v1", s); } catch (e) {}
}, seed);

const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

async function shot(name) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${name}.png` });
  console.log("shot", name);
}

// 1) Budget
await shot("01-budget");

// 2) Assign sheet — tap the "Έκτακτο ταμείο" goal category
await page.getByText("Έκτακτο ταμείο", { exact: true }).first().click();
await page.waitForTimeout(700);
await shot("02-assign");
await page.keyboard.press("Escape").catch(() => {});
// close the sheet by tapping the backdrop / X
await page.mouse.click(206, 60).catch(() => {});
await page.waitForTimeout(500);

// 3) Activity
await page.getByRole("button", { name: "Κινήσεις" }).click();
await shot("03-activity");

// 4) Reports
await page.getByRole("button", { name: "Αναφορές" }).click();
await page.waitForTimeout(800);
await shot("04-reports");

// 5) More (scheduled + backup)
await page.getByRole("button", { name: "Περισσότερα" }).click();
await shot("05-more");

await browser.close();
console.log("done");
