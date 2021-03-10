/*
  2021/03/10 レビュー全件取得後、ネガティブキーワードのフィルタリングをする為のスクリプト
  このスクリプトはスタンドアロンで動作する

  input: 全件クチコミ検索結果csv(とりあえずsearch_keywords.csvというファイル名)
  domain: contain_keywords.txtのキーワードでレビューをフィルタリング
  output: フィルタリング結果のclinic_review_yyyyMMdd.csvファイルを出力
*/

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const format = require("date-fns/format");
const ja = require("date-fns/locale/ja");
const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const csvSync = require("csv-parse/lib/sync");

// 出力csvファイル名のpostfix用に現在日時取得
const formattedDate = format(new Date(), "yyyy-MM-dd", { locale: ja });

// 抽出キーワードファイルパス
const inputContainPath = "src/review/input/contain_keywords.txt";

// 検索キーワードcsvファイルパス
const csvInputPath = "src/reg-exp/search_keywords.csv";

// csv出力ファイルパス
const outputPath = `src/reg-exp/clinic_review_${formattedDate}.csv`;

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
const toFileEncoding = "Shift_JIS";

getSearchKeywordLinesByCsv = function () {
  // 検索キーワードcsvファイル読み込み
  const data = fs.readFileSync(csvInputPath);
  const results = csvSync(data);
  if (results.length === 0)
    throw Error("The line of the read file does not exist.");
  // 取得した店舗情報をオブジェクト配列にして返却
  const storeObjects = results.map((line) => ({
    name: line[0],
    address: line[1],
    telephoneNumber: line[2],
    score: line[3],
    reviewCount: line[4],
    review: line[5],
  }));
  if (storeObjects.length === 0) throw Error("The Line length zero.");
  return storeObjects;
};

getContainKeywords = function () {
  // クチコミ抽出キーワードファイル読み込み
  var text = fs.readFileSync(inputContainPath, fileEncoding);
  var lines = text.toString().split("\n");
  return lines;
};

writeCsv = async function (outputData) {
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

utf8toShiftJIS = function () {
  // csvファイルテキスト取得
  var originalText = fs.readFileSync(outputPath, fileEncoding);
  // ファイルを「書き込み専用モード」で開く
  var fd = fs.openSync(outputPath, "w");
  // 書き出すデータをShift_JISに変換して、バッファとして書き出す
  var buf = iconv.encode(originalText, toFileEncoding);
  fs.write(fd, buf, 0, buf.length, function (err, written, buffer) {
    //  バッファをファイルに書き込む
    if (err) throw err;
    console.log("Converted csv file from shift-jis to utf8.");
  });
};

(async () => {
  try {
    // 検索キーワードファイル読み込み
    const storeObjects = getSearchKeywordLinesByCsv();
    // 抽出キーワードファイル読み込み
    const containKeywords = getContainKeywords();
    // 抽出キーワードが存在すれば絞り込み
    if (containKeywords.length > 0 && containKeywords[0] !== "") {
      // 複数キーワードを正規表現変換
      const keywords = containKeywords.join("|");
      const regexp = new RegExp(keywords);
      console.log("containKeywords:", regexp);
      // 正規表現にマッチしたクチコミをフィルタリング
      outputData = storeObjects.filter((data) => regexp.test(data.review));
    }

    // csv出力
    await writeCsv(outputData);

    // utf8からshift-jisに変換
    utf8toShiftJIS();
  } catch (error) {
    console.error("[ERROR] ", error);
    throw error;
  } finally {
  }
})();
