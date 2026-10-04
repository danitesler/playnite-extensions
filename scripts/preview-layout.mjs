// Checks that a theme's HTML previews lay out like the theme itself (advisory; exit code is always 0).
//   node scripts/preview-layout.mjs <ThemeDir>
// Previews tag the regions that matter with data-part (rules: .claude/skills/playnite-theme-dev/previews.md):
//   top bar:   PART_ElemMainMenu PART_TextMainSearch PART_PanelMainItems PART_ToggleFilter PART_ToggleNotifications
//              PART_PanelMainPluginItems   (the x:Name values of Views/TopPanel.xaml)
//   details:   game-list, game-page, metadata
//   settings:  settings-window, settings-nav, settings-content, settings-buttons
// The top bar's left-to-right order is derived from the theme's own src/Views/TopPanel.xaml (DockPanel children and
// DockPanel.Dock), then compared with where Chromium actually draws the tagged parts.
import path from 'path';
import fs from 'fs';
import { launchBrowser } from './preview-tokens.mjs';

const VIEWPORT = { width: 1280, height: 720 };
const TOP_PARTS = ['PART_ElemMainMenu', 'PART_TextMainSearch', 'PART_PanelMainItems', 'PART_ToggleFilter', 'PART_ToggleNotifications', 'PART_PanelMainPluginItems'];
const TOP_REQUIRED = ['PART_TextMainSearch', 'PART_PanelMainItems', 'PART_ToggleFilter'];

// Left-to-right order of the top panel parts, as the DockPanel in TopPanel.xaml lays them out:
// Left-docked children in document order, then Right-docked children in reverse (the first one sits at the edge).
export function expectedTopOrder(themeDir) {
  const file = path.join(themeDir, 'src', 'Views', 'TopPanel.xaml');
  if (!fs.existsSync(file)) return null;
  const xaml = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length));
  const anchor = xaml.indexOf('x:Name="PART_TextMainSearch"');
  if (anchor < 0) return null;

  // Smallest <DockPanel>...</DockPanel> that contains the search box.
  const stack = [];
  let best = null;
  for (const m of xaml.matchAll(/<(\/?)DockPanel\b[^>]*?(\/?)>/g)) {
    if (m[2]) continue;
    if (!m[1]) stack.push(m.index);
    else {
      const start = stack.pop();
      const end = m.index + m[0].length;
      if (start !== undefined && start < anchor && end > anchor && (!best || end - start < best[1] - best[0])) best = [start, end];
    }
  }
  if (!best) return null;

  const body = xaml.slice(best[0], best[1]);
  const lefts = [];
  const rights = [];
  for (const m of body.matchAll(/x:Name="(PART_[A-Za-z]+)"/g)) {
    if (!TOP_PARTS.includes(m[1])) continue;
    const tagStart = body.lastIndexOf('<', m.index);
    const tagEnd = body.indexOf('>', m.index);
    const tag = body.slice(tagStart, tagEnd);
    const dock = (tag.match(/DockPanel\.Dock="(\w+)"/) || [])[1] || 'Left';
    (dock === 'Right' ? rights : lefts).push(m[1]);
  }
  return [...lefts, ...rights.reverse()];
}

async function measure(page, file) {
  await page.goto('file://' + path.resolve(file));
  return page.evaluate(() => {
    const parts = {};
    for (const el of document.querySelectorAll('[data-part]')) {
      const r = el.getBoundingClientRect();
      parts[el.dataset.part] = { l: r.left, t: r.top, r: r.right, b: r.bottom, text: (el.innerText || '').trim(), raw: (el.textContent || '').trim() };
    }
    return parts;
  });
}

function checkDetails(parts, themeDir, notes) {
  const missing = [...TOP_REQUIRED, 'game-list', 'game-page'].filter((p) => !parts[p]);
  if (missing.length) notes.push(`missing data-part: ${missing.join(', ')}`);

  const items = parts.PART_PanelMainItems;
  if (items && /[A-Za-z]{2,}/.test(items.text)) notes.push(`view switches (PART_PanelMainItems) contain text "${items.text.split('\n')[0]}"; they are icons only`);

  const list = parts['game-list'];
  const page = parts['game-page'];
  if (list && page && list.r > page.l + 2) notes.push('game-list must sit to the left of game-page');

  const expected = expectedTopOrder(themeDir);
  const drawn = TOP_PARTS.filter((p) => parts[p]).sort((a, b) => (parts[a].l + parts[a].r) - (parts[b].l + parts[b].r));
  if (!expected) notes.push('could not derive the top panel order from src/Views/TopPanel.xaml');
  else {
    const want = expected.filter((p) => parts[p]);
    if (want.join() !== drawn.join()) notes.push(`top bar order is ${drawn.map(short).join(' > ')}; src/Views/TopPanel.xaml gives ${want.map(short).join(' > ')}`);
  }
}

function checkSettings(parts, notes) {
  const missing = ['settings-window', 'settings-nav', 'settings-content', 'settings-buttons'].filter((p) => !parts[p]);
  if (missing.length) { notes.push(`missing data-part: ${missing.join(', ')}`); return; }
  const { 'settings-nav': nav, 'settings-content': content, 'settings-buttons': bar } = parts;
  if (nav.r > content.l + 2) notes.push('settings-nav (section tree) must sit to the left of settings-content');
  if (bar.t < nav.b - 2 || bar.t < content.b - 2) notes.push('settings-buttons must be a bar below the tree and the page');
  // textContent, case-insensitive: themes upper-case or small-cap their button labels with CSS.
  const label = bar.raw.toLowerCase();
  const save = label.indexOf('save');
  const cancel = label.indexOf('cancel');
  if (save < 0 || cancel < 0) notes.push('settings-buttons needs Save and Cancel');
  else if (save > cancel) notes.push('Cancel must be the right-most button, after Save');
}

function checkInside(parts, notes) {
  const out = Object.entries(parts).filter(([, r]) => r.r > VIEWPORT.width + 1 || r.b > VIEWPORT.height + 1 || r.l < -1 || r.t < -1).map(([n]) => n);
  if (out.length) notes.push(`extends outside the ${VIEWPORT.width}x${VIEWPORT.height} frame (clipped): ${out.join(', ')}`);
}

const short = (p) => p.replace('PART_', '');

async function main() {
  const themeArg = process.argv[2];
  if (!themeArg) { console.error('usage: preview-layout.mjs <ThemeDir>'); process.exit(1); }
  const themeDir = path.resolve(themeArg);
  const art = path.join(themeDir, 'art');
  const files = ['preview-details.html', 'preview-settings.html'].map((f) => path.join(art, f)).filter((f) => fs.existsSync(f));
  if (files.length === 0) { console.log('no previews'); return; }

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: VIEWPORT });
    for (const file of files) {
      const notes = [];
      const parts = await measure(page, file);
      if (Object.keys(parts).length === 0) notes.push('no data-part tags, layout cannot be checked (add them, see previews.md)');
      else {
        if (file.endsWith('preview-details.html')) checkDetails(parts, themeDir, notes);
        else checkSettings(parts, notes);
        checkInside(parts, notes);
      }
      console.log(`${path.basename(file)}: ${notes.length ? '' : 'layout ok'}`);
      for (const n of notes) console.log(`  ${n}`);
    }
  } finally {
    await browser.close();
  }
}

await main();
