const puppeteer = require("puppeteer");
const shopInformation = require("./lib/shop-information.js");
const shopReview = require("./lib/shop-review.js");
const WINDOW_WIDTH = 1600;
const WINDOW_HIGHT = 950;

(async () => {
  const browser = await puppeteer.launch({
    // 動作確認するためheadlessモードにしない
    headless: false,
    // 動作確認しやすいようにpuppeteerの操作を遅延させる
    slowMo: 10,
    args: [
      // Chromeウィンドウのサイズ
      "--window-size=1600,950",
      // Chromeウィンドウのポジション
      "--window-position=100,50",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });
  const page = await browser.newPage();
  // 画面の大きさ設定
  await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HIGHT });
  try {
    await page.goto("https://www.google.com/");
    // await page.type("input[name=q]", "中野駅南歯科クリニック", { delay: 100 });
    await page.type("input[name=q]", "中野駅南歯科クリニック", { delay: 100 });
    await Promise.all([
      // page.waitForNavigation({ waitUntil: ["load", "networkidle2"] }),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.click('input[type="submit"]'),
    ]);

    // 店舗名を取得
    const name = await shopInformation.getShopName(page);
    console.log("name:", name);

    // 所在地を取得
    const address = await shopInformation.getShopAddress(page);
    console.log("address:", address);

    // 電話番号を取得
    const telephoneNumber = await shopInformation.getShopTelephoneNumber(page);
    console.log("telephoneNumber:", telephoneNumber);

    // 店舗レビュースコアを取得
    const score = await shopInformation.getShopScore(page);

    // 店舗レビュー数を取得
    const reviewCount = await shopInformation.getShopReviewCount(page);
    console.log("scores:", score, reviewCount);

    // クチコミダイアログを開く
    await shopReview.openShopReviewDialog(page);

    // クチコミダイアログをクチコミ全件分スクロール
    await shopReview.scrollShopReviewDialog(page, reviewCount);

    // 「もっと見る」リンクを全てクリック
    await shopReview.clickAllMoreLink(page);

    // 全てのレビューを取得
    const reviews = await shopReview.getAllReviews(page);

    reviews.map((review) => {
      console.log(review);
    });

    // スクリーンショット取得
    await page.screenshot({
      path: "screenshot/review.png",
      fullPage: true,
    });
  } catch (err) {
    console.error("[ERROR] ", err);
    throw err;
  } finally {
    await browser.close();
  }
})();
