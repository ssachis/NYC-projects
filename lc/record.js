// Clicks through the live Last Commit site and records it (CDP screencast frames + timestamps).
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  fs.mkdirSync('lc/frames', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://ssachis.github.io/last-commit/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const cdp = await page.context().newCDPSession(page);
  const frames = []; let n = 0;
  cdp.on('Page.screencastFrame', async f => {
    const file = `f${String(n++).padStart(6, '0')}.jpg`;
    fs.writeFileSync('lc/frames/' + file, Buffer.from(f.data, 'base64'));
    frames.push({ file, ts: f.metadata.timestamp });
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {}
  });
  await page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:.01;z-index:99999;pointer-events:none'; document.documentElement.appendChild(d); let i = 0; setInterval(() => d.style.background = (i++ % 2) ? '#fff' : '#fefefe', 100); });
  await page.addStyleTag({ content: '.__tap{position:fixed;z-index:99999;pointer-events:none;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:rgba(255,255,255,.5);border:3px solid rgba(40,80,60,.8);transition:transform .45s ease-out,opacity .45s ease-out}' });
  await page.evaluate(() => addEventListener('pointerdown', e => { const d = document.createElement('div'); d.className = '__tap'; d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; document.body.appendChild(d); requestAnimationFrame(() => requestAnimationFrame(() => { d.style.transform = 'scale(1.6)'; d.style.opacity = '0'; })); setTimeout(() => d.remove(), 600); }, true));
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1440, maxHeight: 900, everyNthFrame: 1 });
  const marks = []; const mark = l => marks.push({ l, t: Date.now() / 1000 });
  const W = ms => page.waitForTimeout(ms);
  const smooth = (y, ms = 1500) => page.evaluate(([y, ms]) => new Promise(r => { const el = document.scrollingElement, s = el.scrollTop, t0 = performance.now(); const st = now => { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2*k*k : 1 - (-2*k+2)**2/2; el.scrollTop = s + (y - s) * e; k < 1 ? requestAnimationFrame(st) : r(); }; requestAnimationFrame(st); }), [y, ms]);
  const nav = async label => { await page.getByRole('navigation', { name: 'Primary' }).getByText(label, { exact: true }).click(); };
  try {
    mark('welcome'); await W(5500);
    mark('home'); await page.getByText('Enter John’s World').click(); await W(3500); await smooth(350, 1800); await W(1500);
    mark('repo'); await nav('Repositories'); await W(3000); await smooth(420, 2000); await W(1800);
    mark('ask'); await nav('Advice'); await W(1500);
    await page.locator('main button').filter({ has: page.locator('strong') }).first().click(); await W(5000);
    mark('first'); await nav('First commit'); await W(1600);
    await page.locator('button.pick').first().click(); await W(2200);
    for (let i = 0; i < 2; i++) { const b = page.locator('button.step-done').first(); if (await b.count()) { await b.click(); await W(1500); } }
    await W(2500);
    mark('end');
  } catch (e) { console.log('FLOW ERROR', e.message); mark('error'); }
  await cdp.send('Page.stopScreencast'); await W(300);
  fs.writeFileSync('lc/timeline.json', JSON.stringify({ frames, marks, now: Date.now() / 1000 }, null, 1));
  console.log('frames', frames.length, JSON.stringify(marks));
  await browser.close();
})();
