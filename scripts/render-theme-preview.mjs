// Renders a theme's HTML mockup to PNG with Chromium (Playwright). Approximate replica, not a Playnite capture.
//   NODE_PATH=$(npm root -g) node scripts/render-theme-preview.mjs src/themes/<Name>/art/preview-grid.html [out.png]
// The PNG defaults to the HTML's path with .png. Set CHROMIUM to a browser executable if Playwright cannot find one.
import { createRequire } from 'module';
import path from 'path';

const [html, out] = process.argv.slice(2);
if (!html) { console.error('usage: render-theme-preview.mjs <preview.html> [out.png]'); process.exit(1); }
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.resolve(html));
const target = out || html.replace(/\.html$/, '.png');
await page.screenshot({ path: target });
await browser.close();
console.log('wrote ' + target);
