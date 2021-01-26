const puppeteer = require("puppeteer");
let shopInformation = require("./lib/shop-information.js");
let shopReview = require("./lib/shop-review.js");

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // 動作確認するためheadlessモードにしない
    slowMo: 10, // 動作確認しやすいようにpuppeteerの操作を遅延させる
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
  // Chromeのウィンドウ自体の大きさの調整ではないです
  await page.setViewport({ width: 1600, height: 950 });
  try {
    await page.goto("https://www.google.com/");
    // await page.type("input[name=q]", "中野駅南歯科クリニック", { delay: 100 });
    await page.type("input[name=q]", "中野駅南歯科クリニック", { delay: 100 });
    await Promise.all([
      // page.waitForNavigation({ waitUntil: ["load", "networkidle2"] }),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.click('input[type="submit"]'),
    ]);

    const name = await shopInformation.getShopName(page);
    console.log("name:", name);

    const address = await shopInformation.getShopAddress(page);
    console.log("address:", address);

    const telephoneNumber = await shopInformation.getShopTelephoneNumber(page);
    console.log("telephoneNumber:", telephoneNumber);

    // const scoreElements = await page.$$(
    //   '[data-attrid="kc:/collection/knowledge_panels/local_reviewable:star_score"] > div > div > span'
    // );
    // if (2 > scoreElements)
    //   throw Error("Score and number of reviews not found.");
    // console.log("score:", scoreElements);

    // const scores = await Promise.all(
    //   scoreElements.map(
    //     async (elementHandle) =>
    //       await (await elementHandle.getProperty("innerText")).jsonValue()
    //   )
    // );

    const score = await shopInformation.getShopScore(page);
    const reviewCount = await shopInformation.getShopReviewCount(page);

    console.log("scores:", score, reviewCount);

    const reviewDialogLink = await page.waitForSelector(
      '[data-async-trigger="reviewDialog"]'
    );
    await Promise.all([
      page.waitForSelector("div.review-dialog-list", { visible: true }),
      reviewDialogLink.click(),
    ]);

    // クチコミダイアログをクチコミ全件分スクロール
    shopReview.scrollShopReviewDialog(page);

    await page.$$eval("a.review-more-link", (links) =>
      links.map((link) => link.click())
    );

    const reviewElements = await page.$$("div.gws-localreviews__google-review");
    if (reviewElements.length === 0) throw Error("There is no review count.");
    const reviews = await Promise.all(
      reviewElements.map(
        async (elementHandle) =>
          await (await elementHandle.getProperty("innerText")).jsonValue()
      )
    );

    // reviews.map((review) => {
    //   console.log(review);
    // });

    await page.screenshot({
      path: "screenshot/review.practice.png",
      fullPage: true,
    });
  } catch (err) {
    console.error("[ERROR] ", err);
    throw err;
  } finally {
    // await browser.close();
  }
})();
