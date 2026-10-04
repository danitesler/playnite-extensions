// Renders a theme's HTML mockup to PNG with Chromium (Playwright).
//   node scripts/render-theme-preview.mjs src/themes/<Name>/art/preview-details.html [out.png]
// The PNG defaults to the HTML's path with .png. Set CHROMIUM to a browser executable if Playwright cannot find one.
import path from 'path';
import fs from 'fs';
import { launchBrowser, tokenStyle } from './preview-tokens.mjs';

const [html, out] = process.argv.slice(2);
if (!html) { console.error('usage: render-theme-preview.mjs <preview.html> [out.png]'); process.exit(1); }

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.resolve(html));
// The theme's own tokens (src/tokens.css) so var(--token) in the preview resolves; art/ sits next to src/.
const tokens = tokenStyle(path.resolve(path.dirname(html), '..'));
if (tokens) await page.addStyleTag({ content: tokens });
const target = out || html.replace(/\.html$/, '.png');
fs.mkdirSync(path.dirname(path.resolve(target)), { recursive: true });
await page.screenshot({ path: target });
await browser.close();
console.log('wrote ' + target);

