const puppeteer = require("puppeteer");
const scraping = require("./scraping.js");
const files = require("./lib/files.js");
const WINDOW_WIDTH = 1600;
const WINDOW_HIGHT = 950;

(async () => {
  const browser = await puppeteer.launch({
    // 動作確認するためheadlessモードにしない
    headless: false,
    // 動作確認しやすいようにpuppeteerの操作を遅延
    slowMo: 10,
    args: [
      // Chromeウィンドウのサイズ
      `--window-size=${WINDOW_WIDTH}, ${WINDOW_HIGHT}`,
      // Chromeウィンドウのポジション
      "--window-position=100,50",
    ],
  });
  const page = await browser.newPage();
  // 画面の大きさ設定
  await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HIGHT });
  try {
    // 検索キーワードファイル読み込み
    const keywords = files.getSearchKeywords();
    let outputData = [];
    // loop内を同期で処理する為 for of
    for (const keyword of keywords) {
      // 店舗レビューオブジェクト取得
      const shopReviews = await scraping.scrapingShopReviews(page, keyword);
      // 最終的に出力する配列に結合
      outputData = outputData.concat(shopReviews);
    }
    // csv出力
    await files.writeScv(outputData);
  } catch (error) {
    console.error("[ERROR] ", error);
    throw error;
  } finally {
    await browser.close();
  }
})();
