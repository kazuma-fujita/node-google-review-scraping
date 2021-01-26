exports.scrollShopReviewDialog = async function (page) {
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
