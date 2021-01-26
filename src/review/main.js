const puppeteer = require("puppeteer");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const format = require("date-fns/format");
const ja = require("date-fns/locale/ja");
const shopInformation = require("./lib/shop-information.js");
const shopReview = require("./lib/shop-review.js");
const WINDOW_WIDTH = 1600;
const WINDOW_HIGHT = 950;

async function scrapingShopReviews(page, shopName) {
  // Google検索Topを開く
  await page.goto("https://www.google.com/");
  console.log("searchKeyword:", shopName);
  // 店舗名を入力
  await page.type("input[name=q]", shopName, { delay: 100 });
  // 検索実行
  await Promise.all([
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
  console.log("score:", score);

  // 店舗レビュー数を取得
  const reviewCount = await shopInformation.getShopReviewCount(page);
  console.log("reviewCount:", reviewCount);

  // クチコミダイアログを開く
  await shopReview.openShopReviewDialog(page);

  // クチコミダイアログをクチコミ全件分スクロール
  await shopReview.scrollShopReviewDialog(page, reviewCount);

  // 「もっと見る」リンクを全てクリック
  await shopReview.clickAllMoreLink(page);

  // 全てのレビューを取得
  const reviews = await shopReview.getAllReviews(page);

  // 取得した店舗情報をオブジェクト配列にして返却
  const storeObjects = reviews.map((review) => ({
    name: name,
    address: address,
    telephoneNumber: telephoneNumber,
    score: score,
    reviewCount: reviewCount,
    review: review,
  }));

  return storeObjects;
}

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
    var text = fs.readFileSync("src/review/input/search_keywords.txt", "utf8");
    var lines = text.toString().split("\n");
    if (lines.length === 0)
      throw Error("The line of the read file does not exist.");
    let outputData = [];
    // loop内を同期で処理する為 for of
    for (const line of lines) {
      // 店舗レビューオブジェクト取得
      const shopReviews = await scrapingShopReviews(page, line);
      // 最終的に出力する配列に結合
      outputData = outputData.concat(shopReviews);
    }

    // 出力csvファイル名のpostfix用に現在日時取得
    const formattedDate = format(new Date(), "yyyy-MM-dd", { locale: ja });
    // csvファイル出力設定
    const csvWriter = createCsvWriter({
      // 出力ファイル名
      path: `src/review/out/shop_review_${formattedDate}.csv`,
      // csvヘッダー設定
      header: [
        { id: "name", title: "施設名" },
        { id: "address", title: "住所" },
        { id: "telephoneNumber", title: "電話番号" },
        { id: "score", title: "レビュースコア" },
        { id: "reviewCount", title: "クチコミ数" },
        { id: "review", title: "クチコミ" },
      ],
      encoding: "utf8",
    });
    // csv出力
    await csvWriter
      .writeRecords(outputData)
      .then(() => console.log("Output csv complete."))
      .catch((error) => console.error(error));
  } catch (error) {
    console.error("[ERROR] ", error);
    throw error;
  } finally {
    await browser.close();
  }
})();
