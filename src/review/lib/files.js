const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const format = require("date-fns/format");
const ja = require("date-fns/locale/ja");
const fs = require("fs");

// 出力csvファイル名のpostfix用に現在日時取得
const formattedDate = format(new Date(), "yyyy-MM-dd", { locale: ja });

// 検索キーワードファイルパス
const inputPath = "src/review/input/search_keywords.txt";

// csv出力ファイルパス
const outputPath = `src/review/output/shop_review_${formattedDate}.csv`;

// csvヘッダー
const csvHeader = [
  { id: "name", title: "施設名" },
  { id: "address", title: "住所" },
  { id: "telephoneNumber", title: "電話番号" },
  { id: "score", title: "レビュースコア" },
  { id: "reviewCount", title: "クチコミ数" },
  { id: "review", title: "クチコミ" },
];

const fileEncoding = "utf8";

exports.getSearchKeywords = function () {
  // 検索キーワードファイル読み込み
  var text = fs.readFileSync(inputPath, fileEncoding);
  var lines = text.toString().split("\n");
  if (lines.length === 0)
    throw Error("The line of the read file does not exist.");
  return lines;
};

exports.writeScv = async function (outputData) {
  // csvファイル出力設定
  const csvWriter = createCsvWriter({
    // 出力ファイル名
    path: outputPath,
    // csvヘッダー設定
    header: csvHeader,
    encoding: fileEncoding,
  });
  // csv出力
  await csvWriter
    .writeRecords(outputData)
    .then(() => console.log("Output csv complete."))
    .catch((error) => console.error(error));
};
