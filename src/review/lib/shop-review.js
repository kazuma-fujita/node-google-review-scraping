exports.openShopReviewDialog = async function (page) {
  // 「Googleのクチコミ(n)」リンク取得
  const reviewDialogLink = await page.waitForSelector(
    '[data-async-trigger="reviewDialog"]'
  );
  // ダイアログを開く時は waitForSelector に visible: true オプションをつける
  await Promise.all([
    page.waitForSelector("div.review-dialog-list", { visible: true }),
    reviewDialogLink.click(),
  ]);
};

exports.scrollShopReviewDialog = async function (page, reviewCount) {
  // evaluateブロック内のconsole.log出力の為、コンソールイベントを登録
  page.on("console", (msg) => {
    for (let i = 0; i < msg._args.length; ++i)
      console.log(`${i}: ${msg._args[i]}`);
  });
  // クチコミ全件表示の為、review数を10で割って四捨五入繰り上げ数分loop
  const loopCount = Math.ceil(parseInt(reviewCount, 10) / 10);
  // クチコミダイアログのセレクター名
  const reviewDialogSelector = "div.review-dialog-list";
  await page.evaluate(
    async ({ selector, loopCount }) => {
      await new Promise((resolve, _) => {
        // ダイアログのスクロール量
        let distance = 3000;
        // 次にスクロールするまでの間隔(ms)
        let interval = 1500;
        let count = 0;
        // クチコミダイアログのクチコミを全件表示するまでscroll
        let timer = setInterval(() => {
          document.querySelector(selector).scrollBy(0, distance);
          // loopCountに達したらscroll終了
          if (count++ === loopCount) {
            clearInterval(timer);
            resolve();
          }
        }, interval);
      });
    },
    { selector: reviewDialogSelector, loopCount }
  );
};

exports.clickAllMoreLink = async function (page) {
  // クチコミダイアログ内の「もっと見る」リンクを全て開く
  await page.$$eval("a.review-more-link", (links) =>
    links.map((link) => link.click())
  );
};

exports.getAllReviews = async function (page) {
  // クチコミダイアログの一覧要素を取得
  const reviewElements = await page.$$("div.gws-localreviews__google-review");
  if (reviewElements.length === 0) throw Error("There is no review count.");
  // クチコミ配列を取得
  const reviews = await Promise.all(
    reviewElements.map(
      async (elementHandle) =>
        await (await elementHandle.getProperty("innerText")).jsonValue()
    )
  );
  return reviews;
};
