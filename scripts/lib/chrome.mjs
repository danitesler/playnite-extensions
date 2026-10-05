// Minimal headless Chrome driver over the DevTools protocol, so the preview scripts need no npm packages.
// Needs Node 22+ (global WebSocket) and an installed Chrome, Edge or Chromium; set CHROMIUM to an executable to override.
//   const browser = await launchBrowser();
//   const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
//   await page.goto(url) | page.setContent(html); await page.addStyleTag({ content }); await page.evaluate(fn, arg);
//   await page.screenshot({ path, omitBackground, selector }); page.cdp.send(method, params); await browser.close();
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export function findBrowser() {
  if (process.env.CHROMIUM && fs.existsSync(process.env.CHROMIUM)) return process.env.CHROMIUM;
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/opt/pw-browsers/chromium'
  ];
  return candidates.find((c) => fs.existsSync(c));
}

class Connection {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id) {
        const p = this.pending.get(m.id);
        this.pending.delete(m.id);
        if (p) m.error ? p.reject(new Error(`${p.method}: ${m.error.message}`)) : p.resolve(m.result);
      } else {
        for (const l of this.listeners) l(m);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject, method }));
  }
}

export async function launchBrowser() {
  if (typeof WebSocket === 'undefined') throw new Error('Node 22+ is needed (global WebSocket).');
  const exe = findBrowser();
  if (!exe) throw new Error('No Chrome, Edge or Chromium found. Set CHROMIUM to a browser executable.');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-chrome-'));
  const proc = spawn(exe, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files', 'about:blank'],
  { stdio: 'ignore' });
  const portFile = path.join(dir, 'DevToolsActivePort');
  let ws = null;
  for (let i = 0; i < 150 && !ws; i++) {
    await new Promise((r) => setTimeout(r, 100));
    if (fs.existsSync(portFile)) {
      const [port, browserPath] = fs.readFileSync(portFile, 'utf8').trim().split('\n');
      if (browserPath) ws = `ws://127.0.0.1:${port}${browserPath}`;
    }
  }
  if (!ws) { proc.kill(); throw new Error('Browser did not start.'); }
  const socket = new WebSocket(ws);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = () => reject(new Error('DevTools connection failed.')); });
  const conn = new Connection(socket);
  return {
    async newPage(opts = {}) {
      const { targetId } = await conn.send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await conn.send('Target.attachToTarget', { targetId, flatten: true });
      return makePage(conn, sessionId, targetId, opts);
    },
    async close() {
      try { await conn.send('Browser.close'); } catch { /* already gone */ }
      socket.close();
      proc.kill();
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  };
}

async function makePage(conn, sessionId, targetId, opts) {
  const send = (method, params) => conn.send(method, params, sessionId);
  const { width = 1280, height = 720 } = opts.viewport || {};
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: opts.deviceScaleFactor || 1, mobile: false });
  const waitLoad = () => new Promise((resolve) => {
    const l = (m) => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') { conn.listeners = conn.listeners.filter((x) => x !== l); resolve(); } };
    conn.listeners.push(l);
  });
  const evaluate = async (fn, arg) => {
    const expr = typeof fn === 'function' ? `(${fn})(${JSON.stringify(arg === undefined ? null : arg)})` : fn;
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const page = {
    cdp: { send },
    async goto(url) { const loaded = waitLoad(); await send('Page.navigate', { url }); await loaded; },
    async setContent(html) {
      const { frameTree } = await send('Page.getFrameTree');
      await send('Page.setDocumentContent', { frameId: frameTree.frame.id, html });
    },
    addStyleTag: ({ content }) => evaluate((css) => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }, content),
    evaluate,
    async screenshot({ path: file, omitBackground = false, selector } = {}) {
      if (omitBackground) await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
      const params = { format: 'png', captureBeyondViewport: false };
      if (selector) {
        const r = await evaluate((sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }, selector);
        params.clip = { ...r, scale: 1 };
      }
      const { data } = await send('Page.captureScreenshot', params);
      if (file) fs.writeFileSync(file, Buffer.from(data, 'base64'));
      return Buffer.from(data, 'base64');
    },
    async close() { await conn.send('Target.closeTarget', { targetId }); }
  };
  return page;
}
