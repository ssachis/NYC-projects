// Takes a screenshot of each project's front page for the cards on index.html.
// Run by .github/workflows/screenshots.yml (it needs the internet and the local servers it starts).
const { chromium } = require('playwright');
const shots = [
  ['lookup-nyc', 'https://ssachis.github.io/LookUp-NYC/'],
  ['busyqueue', 'https://ssachis.github.io/BusyQueue/demo/'],
  ['signal', 'http://127.0.0.1:8101/frontend/?demo=1'],
  ['last-commit', 'https://ssachis.github.io/last-commit/'],
  ['fusionedges', 'http://127.0.0.1:8000/'],
  ['ghosttown', 'https://ssachis.github.io/GhostTown/'],
  ['wave', 'https://ssachis.github.io/NYC-projects/wave/'],
];
(async () => {
  const browser = await chromium.launch();
  for (const [name, url] of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `img/${name}.jpg`, type: 'jpeg', quality: 82 });
      console.log('ok', name, await page.title());
    } catch (e) { console.log('FAILED', name, e.message.split('\n')[0]); }
    await page.close();
  }
  await browser.close();
})();
