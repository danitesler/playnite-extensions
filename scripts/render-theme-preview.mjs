// Renders a theme's HTML mockup to PNG with Chromium.
//   node scripts/render-theme-preview.mjs src/themes/<Name>/art/preview-details.html [out.png]
//   node scripts/render-theme-preview.mjs <details.html=details.png> <settings.html=settings.png>
// The PNG defaults to the HTML's path with .png. Set CHROMIUM to a browser executable if a browser cannot be found.
import path from 'path';
import fs from 'fs';
import { launchBrowser, loadPreviewPage } from './preview-tokens.mjs';

const args = process.argv.slice(2);
const jobs = /\.html$/i.test(args[0] ?? '') && args.length <= 2
  ? [args]
  : args.map(arg => /^(.+?\.html)=(.+)$/i.exec(arg)?.slice(1));
if (!jobs.length || jobs.some(job => !job)) {
  console.error('usage: render-theme-preview.mjs <preview.html> [out.png] | <preview.html=out.png> [...]');
  process.exit(1);
}

async function renderPreview(page, html, target = html.replace(/\.html$/i, '.png')) {
  // The theme's own tokens (src/tokens.css) so var(--token) in the preview resolves; art/ sits next to src/.
  await loadPreviewPage(page, html, path.resolve(path.dirname(html), '..'));

  // Text that still falls back to an installed font makes the render machine-dependent: say so.
  const cdp = page.cdp;
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
  fs.mkdirSync(path.dirname(path.resolve(target)), { recursive: true });
  await page.screenshot({ path: target });
  console.log('wrote ' + target);
}

const browser = await launchBrowser();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.cdp.send('DOM.enable');
  await page.cdp.send('CSS.enable');
  for (const job of jobs) await renderPreview(page, ...job);
} finally {
  await browser.close();
}

