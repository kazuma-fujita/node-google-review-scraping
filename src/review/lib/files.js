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

// 検索キーワードファイルパス
const inputPath = "src/review/input/search_keywords.txt";

// 検索キーワードcsvファイルパス
const csvInputPath = "src/review/input/search_keywords.csv";

// csv出力ファイルパス
const outputPath = `src/review/output/clinic_review_${formattedDate}.csv`;

// エラー出力ファイルパス
const errorOutputPath = `src/review/output/error_${formattedDate}.txt`;

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

exports.getContainKeywords = function () {
  // クチコミ抽出キーワードファイル読み込み
  var text = fs.readFileSync(inputContainPath, fileEncoding);
  var lines = text.toString().split("\n");
  return lines;
};

exports.getSearchKeywords = function () {
  // 検索キーワードファイル読み込み
  var text = fs.readFileSync(inputPath, fileEncoding);
  var lines = text.toString().split("\n");
  if (lines.length === 0)
    throw Error("The line of the read file does not exist.");
  return lines;
};

exports.getSearchKeywordLinesByCsv = function () {
  // 検索キーワードcsvファイル読み込み
  const data = fs.readFileSync(csvInputPath);
  const results = csvSync(data);
  if (results.length === 0)
    throw Error("The line of the read file does not exist.");
  const lines = results.map((record) => record[0]);
  if (lines.length === 0) throw Error("The Line length zero.");
  return lines;
};

exports.writeCsv = async function (outputData) {
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

exports.utf8toShiftJIS = function () {
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

exports.writeErrorFile = function (errorMessage) {
  fs.appendFile(errorOutputPath, `${errorMessage}\n`, (err) => {
    if (err) throw err;
    console.log(`Write error message [${errorMessage}]`);
  });
};
