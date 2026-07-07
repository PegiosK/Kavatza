import { chromium } from "playwright-core";
import fs from "fs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 820 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await ctx.addInitScript((s) => localStorage.setItem("kavatza_state_v1", s), fs.readFileSync("play/seed.json","utf8"));
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
await page.goto("http://localhost:5055/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const info = await page.evaluate(() => {
  const bars = [...document.querySelectorAll("div")].filter(d => {
    const s = getComputedStyle(d);
    return s.height === "6px" && s.borderRadius === "4px" && d.parentElement;
  });
  const fills = bars.map(b => {
    const f = b.firstElementChild ? getComputedStyle(b.firstElementChild) : null;
    return { track: getComputedStyle(b).backgroundColor, fillW: f ? b.firstElementChild.style.width : null, fillBg: f ? f.backgroundColor : null, y: Math.round(b.getBoundingClientRect().y) };
  });
  const header = document.querySelector("header");
  return {
    barCount: bars.length, fills,
    headerBg: header ? getComputedStyle(header).backgroundColor : null,
    headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
    font: getComputedStyle(document.body).fontFamily,
  };
});
console.log(JSON.stringify(info, null, 1));
console.log("pageerrors:", errors);
await browser.close();
