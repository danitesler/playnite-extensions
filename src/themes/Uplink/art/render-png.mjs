// Renders the menu icons (icons/<name>.svg) to 48px PNGs in src/Images/Icons with Chromium, the same jobs as
// icons.json (which scripts/render-icons.ps1 runs on Windows). Colors are tokens from src/tokens.css.
//   NODE_PATH=$(npm root -g) node art/render-png.mjs   (Playwright from the global modules)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const jobs = JSON.parse(fs.readFileSync(path.join(root, 'icons.json'), 'utf8')).jobs;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const job of jobs) {
  fs.mkdirSync(path.join(root, job.outDir), { recursive: true });
  for (const name of job.icons) {
    const svg = fs.readFileSync(path.join(root, job.svgDir, name + '.svg'), 'utf8');
    await page.setContent(`<html><body style="margin:0;background:transparent">
      <div id="i" style="width:${job.size}px;height:${job.size}px;color:${job.color}">${svg.replace('width="24" height="24"', `width="${job.size}" height="${job.size}"`)}</div></body></html>`);
    const out = path.join(root, job.outDir, name + (job.suffix || '') + '.png');
    await page.locator('#i').screenshot({ path: out, omitBackground: true });
  }
}
await browser.close();
console.log('rendered menu icons');
