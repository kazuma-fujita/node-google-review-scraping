const shopInformation = require("./lib/shop-information.js");
const shopReview = require("./lib/shop-review.js");

exports.scrapingShopReviews = async function (page, shopName) {
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
};
