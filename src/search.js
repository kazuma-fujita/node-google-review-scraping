const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // 動作確認するためheadlessモードにしない
    slowMo: 50, // 動作確認しやすいようにpuppeteerの操作を遅延させる
  });
  const page = await browser.newPage();

  await page.goto("https://www.google.com/");
  await page.type("input[name=q]", "Puppeteer", { delay: 100 });
  await Promise.all([
    page.waitForNavigation(),
    page.click('input[type="submit"]'),
  ]);
  await page.screenshot({ path: "screenshot/search.png", fullPage: true });

  await browser.close();
})();
