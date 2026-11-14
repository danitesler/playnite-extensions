import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));

test('preview tools load HTML from paths containing spaces, # and %', () => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-tools-'));
  try {
    // Copy the actual entry points so both navigation call sites are exercised.
    for (const file of ['render-theme-preview.mjs', 'preview-layout.mjs', 'preview-tokens.mjs', 'lib/chrome.mjs', 'data/fonts.json']) {
      const target = path.join(scratch, 'scripts', file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(repoRoot, 'scripts', file), target);
    }
    const theme = path.join(scratch, 'theme #100%');
    const html = path.join(theme, 'art', 'preview-details.html');
    fs.mkdirSync(path.dirname(html), { recursive: true });
    fs.writeFileSync(html, '<!doctype html><div data-part="game-page" style="width:100px;height:100px;background:red"></div>');
    const ordinaryHtml = path.join(scratch, 'preview.html');
    fs.copyFileSync(html, ordinaryHtml);
    const secondTheme = path.join(scratch, 'second theme');
    fs.mkdirSync(path.join(secondTheme, 'art'), { recursive: true });
    fs.copyFileSync(html, path.join(secondTheme, 'art', 'preview-details.html'));
    const expectedOutput = path.join(scratch, 'expected.png');
    const baseline = spawnSync(process.execPath, [path.join(scratch, 'scripts/render-theme-preview.mjs'), ordinaryHtml, expectedOutput], {
      encoding: 'utf8', timeout: 30000,
    });
    assert.equal(baseline.status, 0, `baseline render: ${baseline.error || ''}\n${baseline.stderr}`);
    const output = path.join(scratch, 'screenshot-details.png');
    for (const [script, args] of [
      ['render-theme-preview.mjs', [html, output]],
      ['preview-layout.mjs', [theme, secondTheme]],
    ]) {
      const result = spawnSync(process.execPath, [path.join(scratch, 'scripts', script), ...args], {
        encoding: 'utf8', timeout: 30000,
      });
      assert.equal(result.status, 0, `${script}: ${result.error || ''}\n${result.stdout}\n${result.stderr}`);
      if (script === 'render-theme-preview.mjs') {
        assert.deepEqual(fs.readFileSync(output).subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        assert.ok(fs.readFileSync(output).equals(fs.readFileSync(expectedOutput)), 'special-character path must render the same page');
      } else {
        assert.match(result.stdout, /theme #100%\/preview-details\.html:/);
        assert.match(result.stdout, /second theme\/preview-details\.html:/);
        assert.doesNotMatch(result.stdout, /no data-part tags/, 'layout checker must measure the fixture HTML');
      }
    }
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});
