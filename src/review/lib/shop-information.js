exports.getShopName = async function (page) {
  const element = await page.$('[data-attrid="title"]');
  if (!element) throw Error('data-attrid="title" not found.');
  return await (await element.getProperty("innerText")).jsonValue();
};

exports.getShopAddress = async function (page) {
  const elements = await page.$$(
    '[data-attrid="kc:/location/location:address"] > div > div > span'
  );
  return 2 === elements.length
    ? await (await elements[1].getProperty("innerText")).jsonValue()
    : "";
};

exports.getShopTelephoneNumber = async function (page) {
  const elements = await page.$$(
    '[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"] > div > div > span'
  );
  return 2 === elements.length
    ? await (await elements[1].getProperty("innerText")).jsonValue()
    : "";
};

const getScoreElements = async function (page) {
  const elements = await page.$$(
    '[data-attrid="kc:/collection/knowledge_panels/local_reviewable:star_score"] > div > div > span'
  );
  if (2 !== elements.length)
    throw Error(
      'data-attrid="kc:/collection/knowledge_panels/local_reviewable:star_score" not found.'
    );
  return elements;
};

exports.getShopScore = async function (page) {
  const elements = await getScoreElements(page);
  return await (await elements[0].getProperty("innerText")).jsonValue();
};

exports.getShopReviewCount = async function (page) {
  const elements = await getScoreElements(page);
  const reviewText = await (
    await elements[1].getProperty("innerText")
  ).jsonValue();
  const reviewCount = reviewText.match(/\d+/)[0];
  return reviewCount;
};
