// Renders a theme's HTML mockup to PNG with Chromium (Playwright).
//   node scripts/render-theme-preview.mjs src/themes/<Name>/art/preview-details.html [out.png]
// The PNG defaults to the HTML's path with .png. Set CHROMIUM to a browser executable if Playwright cannot find one.
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const [html, out] = process.argv.slice(2);
if (!html) { console.error('usage: render-theme-preview.mjs <preview.html> [out.png]'); process.exit(1); }

function findBrowser() {
  if (process.env.CHROMIUM && fs.existsSync(process.env.CHROMIUM)) return process.env.CHROMIUM;
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

const { chromium } = createRequire(import.meta.url)('playwright');
const executablePath = findBrowser();
const browser = await chromium.launch(executablePath ? { executablePath } : { channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.resolve(html));
const target = out || html.replace(/\.html$/, '.png');
fs.mkdirSync(path.dirname(path.resolve(target)), { recursive: true });
await page.screenshot({ path: target });
await browser.close();
console.log('wrote ' + target);

