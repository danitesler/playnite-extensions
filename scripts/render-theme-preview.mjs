// Renders a theme's HTML mockup to PNG with Chromium.
//   node scripts/render-theme-preview.mjs src/themes/<Name>/art/preview-details.html [out.png]
// The PNG defaults to the HTML's path with .png. Set CHROMIUM to a browser executable if a browser cannot be found.
import path from 'path';
import fs from 'fs';
import { launchBrowser, tokenStyle, fontFaceCss } from './preview-tokens.mjs';

const [html, out] = process.argv.slice(2);
if (!html) { console.error('usage: render-theme-preview.mjs <preview.html> [out.png]'); process.exit(1); }

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.resolve(html));
// The theme's own tokens (src/tokens.css) so var(--token) in the preview resolves; art/ sits next to src/.
const tokens = tokenStyle(path.resolve(path.dirname(html), '..'));
if (tokens) await page.addStyleTag({ content: tokens });
await page.addStyleTag({ content: fontFaceCss() });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
await page.evaluate(() => document.fonts.ready);

// Text that still falls back to an installed font makes the render machine-dependent: say so.
const cdp = page.cdp;
await cdp.send('DOM.enable');
await cdp.send('CSS.enable');
const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
const system = new Map();
const walk = async (n) => {
  if (n.nodeType === 1 && (n.children || []).some((c) => c.nodeType === 3 && /\S/.test(c.nodeValue))) {
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: n.nodeId });
    for (const f of fonts) if (!f.isCustomFont) system.set(f.familyName, (system.get(f.familyName) || 0) + f.glyphCount);
  }
  for (const c of n.children || []) await walk(c);
};
await walk(root);
for (const [name, glyphs] of system) console.error(`  system font used: ${name} (${glyphs} glyphs)`);
const target = out || html.replace(/\.html$/, '.png');
fs.mkdirSync(path.dirname(path.resolve(target)), { recursive: true });
await page.screenshot({ path: target });
await browser.close();
console.log('wrote ' + target);

