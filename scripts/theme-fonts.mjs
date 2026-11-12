#!/usr/bin/env node
// Checks that a theme draws the same fonts in Playnite as in its HTML previews.
//
// Previews draw every font name with a bundled stand-in (scripts/data/fonts.json), so "Eurostile Extended" renders as
// Orbitron on any machine. Playnite only has the fonts Windows ships plus the ones the theme bundles in src/Typography
// and references as `./Typography/#Family`. For each FontFamily key in src/Constants.template.xaml this compares the
// face the preview renders (first name fonts.json knows) with the face Playnite renders (first bundled or Windows
// name, mapped to its stand-in), and checks the bundled files: every referenced family exists, every bundled file is
// referenced, and the folder carries the font license.
//
//   node scripts/theme-fonts.mjs <themeDir>      prints "error: ..." lines; exit code 0 either way
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const reg = JSON.parse(fs.readFileSync(path.join(here, 'data', 'fonts.json'), 'utf8'));
const lc = (s) => s.toLowerCase();
const known = new Map([...Object.entries(reg.families), ...Object.entries(reg.aliases)].map(([k, v]) => [lc(k), v]));
const windows = new Set(reg.windowsFonts.names.map(lc));

// Family names of a TTF/OTF (name IDs 1 and 16).
function fontFamilies(file) {
  const b = fs.readFileSync(file);
  const n = b.readUInt16BE(4);
  for (let i = 0; i < n; i++) {
    const rec = 12 + i * 16;
    if (b.toString('latin1', rec, rec + 4) !== 'name') continue;
    const off = b.readUInt32BE(rec + 8);
    const count = b.readUInt16BE(off + 2), strOff = off + b.readUInt16BE(off + 4);
    const names = new Set();
    for (let r = 0; r < count; r++) {
      const p = off + 6 + r * 12;
      const [plat, , , id, len, so] = [0, 2, 4, 6, 8, 10].map((d) => b.readUInt16BE(p + d));
      if (id !== 1 && id !== 16) continue;
      const raw = b.subarray(strOff + so, strOff + so + len);
      names.add(plat === 3 || plat === 0 ? raw.swap16().toString('utf16le') : raw.toString('latin1'));
    }
    return [...names];
  }
  return [];
}

// The scripts/fonts folder a fonts.json entry draws with ("orbitron", "barlow", ...): faces of one design share it.
const design = (entry) => entry?.faces?.[0]?.file.split('/')[0];

function tokens(themeDir) {
  const file = path.join(themeDir, 'src', 'tokens.css');
  const map = new Map();
  if (!fs.existsSync(file)) return map;
  const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/--([A-Za-z0-9_-]+)\s*:\s*([^;]+);/g)) if (!map.has(m[1])) map.set(m[1], m[2].trim());
  return map;
}

export function checkThemeFonts(themeDir) {
  const errors = [];
  const constants = path.join(themeDir, 'src', 'Constants.template.xaml');
  if (!fs.existsSync(constants)) return errors;
  const tok = tokens(themeDir);
  const xaml = fs.readFileSync(constants, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const typoDir = path.join(themeDir, 'src', 'Typography');
  const files = fs.existsSync(typoDir) ? fs.readdirSync(typoDir).filter((f) => /\.(ttf|otf)$/i.test(f)) : [];
  const bundled = new Map(); // family (lower case) -> files
  for (const f of files) for (const fam of fontFamilies(path.join(typoDir, f))) {
    if (!bundled.has(lc(fam))) bundled.set(lc(fam), []);
    bundled.get(lc(fam)).push(f);
  }
  const used = new Set();

  for (const m of xaml.matchAll(/<FontFamily\s+x:Key="([^"]+)">([^<]*)<\/FontFamily>/g)) {
    const key = m[1];
    const stack = m[2]
      .replace(/\{\{text:([^|}]+)(?:\|([^}]*))?\}\}/g, (_, t, fb) => tok.get(t) ?? fb ?? '')
      .split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);

    let runtime = null; // { name, entry }
    for (const name of stack) {
      const ref = name.match(/^\.\/Typography\/#(.+)$/);
      if (ref) {
        const fam = ref[1].trim();
        if (!bundled.has(lc(fam))) {
          errors.push(`${key}: ./Typography/#${fam} has no matching font file in src/Typography (family names are read from the files).`);
          continue;
        }
        bundled.get(lc(fam)).forEach((f) => used.add(f));
        runtime ??= { name: fam, entry: known.get(lc(fam)) };
        continue;
      }
      if (!runtime && windows.has(lc(name))) runtime = { name, entry: known.get(lc(name)) };
    }
    const previewName = stack.find((n) => known.has(lc(n)));
    if (!previewName || !runtime) continue;
    const want = design(known.get(lc(previewName))), got = design(runtime.entry);
    if (runtime.entry && want !== got) {
      errors.push(`${key}: previews draw "${previewName}" (${want}) but Playnite draws "${runtime.name}" (${got}): ` +
        `"${previewName}" is not a Windows font. Bundle the stand-in's faces in src/Typography and put ./Typography/#<Family> first (playnite-theme-dev reference.md, Bundled fonts).`);
    }
  }

  for (const f of files) if (!used.has(f)) errors.push(`src/Typography/${f} is not referenced by any ./Typography/#Family in Constants.template.xaml; remove it.`);
  if (files.length && !fs.readdirSync(typoDir).some((f) => /^(OFL|LICENSE)/i.test(f))) {
    errors.push('src/Typography bundles fonts without their license; add OFL.txt (copy it from scripts/fonts/<font>/).');
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  for (const d of dirs) for (const e of checkThemeFonts(d)) console.log(`${dirs.length > 1 ? path.basename(d) + ': ' : ''}error: ${e}`);
}
